import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { HttpStatus, type INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { EntityManager } from 'typeorm'
import { randomInt } from 'crypto'

describe('AppController (e2e)', () => {
    let app: INestApplication
    let entityManager: EntityManager
    const userIds: string[] = [] // 배열을 사용하여 생성된 모든 사용자 ID 저장

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()

        entityManager = moduleFixture.get(EntityManager)
    })

    afterAll(async () => {
        await entityManager.delete('valid_token', {})
        await entityManager.delete('point_history', {})
        await entityManager.delete('reservation', {})
        await entityManager.delete('seat', {})
        await entityManager.delete('concert_date', {})
        await entityManager.delete('concert', {})
        await entityManager.delete('waiting_user', {})
        await entityManager.delete('user', {})

        await app.close()
    })

    it(
        'should create 100 users and charge them each 10,000 points',
        async () => {
            const MAX_CONNECTIONS = parseInt(process.env.MAX_CONNECTIONS, 10) * 2

            for (let i = 0; i < MAX_CONNECTIONS; i++) {
                const response = await request(app.getHttpServer())
                    .post('/user')
                    .send({ name: `User${i}` }) // 유저 이름을 User0, User1, ..., User99 로 설정

                expect(response.status).toBe(HttpStatus.OK) // HTTP 201 Created 응답을 확인
                userIds.push(response.body.id) // 응답에서 받은 ID를 userIds 배열에 추가
            }

            // 생성된 모든 사용자에 대해 포인트 충전
            for (const userId of userIds) {
                const chargeResponse = await request(app.getHttpServer()).patch(`/user/charge/${userId}/point`).send({ amount: 10000 }) // 각 사용자에게 10,000 포인트 충전

                expect(chargeResponse.status).toBe(HttpStatus.OK) // HTTP 200 OK 응답을 확인
            }
        },
        6000 * 1000,
    )

    it('should create concerts, dates, and seats', async () => {
        // 1. 아이유 콘서트 생성
        const concertResponse = await request(app.getHttpServer()).post('/concert').send({ singerName: '아이유' })
        expect(concertResponse.status).toBe(HttpStatus.OK)
        const concertId = concertResponse.body.id

        // 2. 7월 7, 8, 9일 콘서트 날짜 생성
        const dates = ['2024-07-07', '2024-07-08', '2024-07-09']
        const concertDates = []

        for (const date of dates) {
            const dateResponse = await request(app.getHttpServer())
                .post(`/concert/${concertId}/`)
                .send({ concertDate: `${date} 20:00:00` })
            expect(dateResponse.status).toBe(HttpStatus.OK)
            concertDates.push(dateResponse.body.id)
        }

        // 3. 각 콘서트 날짜에 1~50개의 좌석 생성
        const MAX_SEATS = parseInt(process.env.MAX_SEATS, 10)
        for (const concertDateId of concertDates) {
            for (let seatNumber = 1; seatNumber <= MAX_SEATS; seatNumber++) {
                const price = randomInt(1000, 3001) // 1000원에서 3000원 사이의 가격
                const seatResponse = await request(app.getHttpServer()).post(`/concert/${concertDateId}/seat`).send({ seatNumber, price })
                expect(seatResponse.status).toBe(HttpStatus.OK)
            }
        }
    })

    it(
        'should handle the token issuance and concert access process for multiple users simultaneously',
        async () => {
            // 1. 동시에 여러 사용자에 대해 토큰 발급 요청
            const tokenRequests = userIds.map(userId => request(app.getHttpServer()).get(`/user-waiting/${userId}/token/generate`))

            const tokenResponses = await Promise.allSettled(tokenRequests)
            resultControl(tokenResponses)

            // 각 토큰 발급 응답을 처리하고, 필요한 경우 폴링을 시작
            const concertAccessRequests = tokenResponses.map(response => {
                if (response.status === 'fulfilled' && response.value.status === HttpStatus.OK) {
                    const { token, waitingNumber } = response.value.body
                    // 유효 토큰일 경우 즉시 콘서트 접근 시도
                    if (waitingNumber === 0) {
                        return handleConcertAccess(token)
                    } else {
                        // 대기 토큰일 경우 폴링을 통해 콘서트 접근 시도
                        return pollForTokenAvailability(token, waitingNumber)
                    }
                } else {
                    return Promise.resolve(null) // 응답이 실패했거나 조건을 만족하지 못하는 경우, null 반환
                }
            })

            const concertAccessResults = await Promise.allSettled(concertAccessRequests)
            resultControl(concertAccessResults)
        },
        6000 * 1000,
    )

    // 폴링 함수: 폴링이 성공적으로 완료될 때까지 재귀적으로 자기 자신을 호출
    async function pollForTokenAvailability(token, waitingNumber) {
        if (waitingNumber === 0) {
            return handleConcertAccess(token)
        } else {
            const delay = calculatePollingDelay(waitingNumber)
            await new Promise(resolve => setTimeout(resolve, delay))

            try {
                const statusResponse = await request(app.getHttpServer()).get('/user-waiting/token/status').set('Authorization', `Bearer ${token}`)
                if (statusResponse.body.waitingNumber == 0) {
                    return pollForTokenAvailability(statusResponse.body.token, statusResponse.body.waitingNumber)
                } else {
                    return pollForTokenAvailability(token, statusResponse.body.waitingNumber)
                }
            } catch (error) {
                console.error('Error during polling token availability:', error)
                throw error // 에러를 다시 발생시켜 호출자에게 알림
            }
        }
    }

    // 폴링 주기를 계산하는 함수
    function calculatePollingDelay(waitingNumber: number): number {
        if (waitingNumber <= 10) {
            return 1000 * 1 // 1초 대기
        } else if (waitingNumber <= 30) {
            return 1000 * 3 // 3초 대기
        } else if (waitingNumber <= 60) {
            return 1000 * 5 // 5초 대기
        } else if (waitingNumber <= 100) {
            return 1000 * 7 // 7초 대기
        } else {
            return 1000 * 10 // 10초 대기
        }
    }

    function resultControl(results: any) {
        const rejectedResponses = results.filter(r => r.status === 'rejected')
        const groupedByReason = rejectedResponses.reduce((groups, response) => {
            const reason = response.reason || 'Unknown'
            groups[reason] = (groups[reason] || 0) + 1
            return groups
        }, {})

        console.log(groupedByReason)
        const successCount = results.filter(r => r.status === 'fulfilled').length
        const failedCount = rejectedResponses.length

        console.log('Success count:', successCount, 'Failed count:', failedCount)
    }

    async function handleConcertAccess(token: string): Promise<void> {
        try {
            let attempt = 0
            const maxAttempts = 3 // 최대 시도 횟수 설정

            while (attempt < maxAttempts) {
                attempt++

                // 1. 콘서트 날짜 조회
                const concertsResponse = await request(app.getHttpServer()).get('/concert/dates').set('Authorization', `Bearer ${token}`)
                if (concertsResponse.status !== HttpStatus.OK) {
                    console.error('Failed to fetch concert dates or no dates available.')
                    return
                }

                // 2. 랜덤으로 콘서트 날짜 선택
                // 콘서트 목록 중 concertDates가 있는 콘서트만 필터링
                const validConcerts = concertsResponse.body.concerts.filter(concert => concert.concertDates && concert.concertDates.length > 0)

                // 랜덤으로 하나의 콘서트 선택
                const selectedConcert = validConcerts[Math.floor(Math.random() * validConcerts.length)]

                const avaliableConcerts = selectedConcert.concertDates.filter(concertDate => concertDate.availableSeats > 0)

                // 선택된 콘서트에서 랜덤으로 하나의 날짜 선택
                const randomDate = avaliableConcerts[Math.floor(Math.random() * avaliableConcerts.length)]
                const concertDateId = randomDate.id
                // 3. 선택된 콘서트 날짜의 좌석 조회
                const seatsResponse = await request(app.getHttpServer()).get(`/concert/${concertDateId}/seats`).set('Authorization', `Bearer ${token}`)
                if (seatsResponse.status !== HttpStatus.OK) {
                    console.error('Failed to fetch seats for the selected concert date.')
                    continue
                }

                // 4. 사용 가능한 좌석 찾기
                const availableSeats = seatsResponse.body.seats.filter(seat => seat.status === 'available')
                if (availableSeats.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableSeats.length)
                    const selectedSeat = availableSeats[randomIndex]

                    try {
                        const reservationResponse = await request(app.getHttpServer())
                            .post(`/concert/${selectedSeat.id}/reservation`)
                            .set('Authorization', `Bearer ${token}`)

                        if (reservationResponse.status === HttpStatus.OK) {
                            // 5. 예약 후 결제 시도
                            const reservationId = reservationResponse.body.id
                            const userId = reservationResponse.body.userId
                            const paymentResponse = await request(app.getHttpServer()).post(`/user-concert/payment/${userId}/${reservationId}`).send({ token })

                            if (paymentResponse.status === HttpStatus.OK) {
                                console.log('Payment successful:', paymentResponse.body)
                                return // 6. 성공적으로 예약 및 결제 완료
                            } else {
                                throw new Error('Failed to pay for reservation.')
                            }
                        }
                    } catch (error) {
                        console.error('Failed to reserve seat:', error.message)
                    }
                } else {
                    console.error('No available seats found.')
                    return
                }
            }
        } catch (error) {
            console.error('Error during concert access handling:', error)
            throw error
        }
    }
})
