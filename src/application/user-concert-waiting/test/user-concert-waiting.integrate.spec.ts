import type { INestApplication } from '@nestjs/common'
import { PaymentUserConcertUseCase } from '../usecase/payment-user-concert.usecase'
import { EntityManager } from 'typeorm'
import { ChargeUserPointUseCase } from 'src/application/user/usecase/charge-user-point.usecase'
import { CreateConcertDateUseCase } from 'src/application/concert/usecase/create-concert-date.usecase'
import { CreateConcertUseCase } from 'src/application/concert/usecase/create-concert.usecase'
import { CreateReservationUseCase } from 'src/application/concert/usecase/create-reservation.usecase'
import { CreateSeatUseCase } from 'src/application/concert/usecase/create-seat.usecase'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { AppModule } from 'src/app.module'
import { CreateUserUseCase } from 'src/application/user/usecase/create-user.usecase'
import { CreateUserRequestDto } from 'src/application/user/dtos/create-user.dto'
import { CreateConcertRequestDto } from 'src/application/concert/dtos/create-concert.dto'
import { CreateConcertDateRequestDto } from 'src/application/concert/dtos/create-concert-date.dto'
import { CreateSeatRequestDto } from 'src/application/concert/dtos/create-seat.dto'
import { CreateReservationRequestDto } from 'src/application/concert/dtos/create-reservation.dto'
import { PaymentUserConcertRequestDto } from '../dtos/payment-user-concert.dto'
import { ChargeUserPointRequestDto } from 'src/application/user/dtos/charge-user-point.dto'
import { NotFoundReservationError } from 'src/domain/concert/exceptions/not-found-reservation.exception'
import { NotFoundUserError } from 'src/domain/user/exceptions/not-found-user.exception'
import { NotAuthReservationError } from 'src/domain/concert/exceptions/not-auth-reservation.exception'
import { InValidPointError } from 'src/domain/user/exceptions/invalid-point.exception'

describe('Integration Tests for User Use Cases', () => {
    let app: INestApplication
    let entityManager: EntityManager
    let createUserUseCase: CreateUserUseCase
    let chargeUserPointUseCase: ChargeUserPointUseCase
    let createConcertDateUseCase: CreateConcertDateUseCase
    let createConcertUseCase: CreateConcertUseCase
    let createReservationUseCase: CreateReservationUseCase
    let createSeatUseCase: CreateSeatUseCase
    let paymentUserConcertUseCase: PaymentUserConcertUseCase

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()

        entityManager = moduleFixture.get(EntityManager)
        createUserUseCase = moduleFixture.get(CreateUserUseCase)
        chargeUserPointUseCase = moduleFixture.get(ChargeUserPointUseCase)
        createConcertDateUseCase = moduleFixture.get(CreateConcertDateUseCase)
        createConcertUseCase = moduleFixture.get(CreateConcertUseCase)
        createReservationUseCase = moduleFixture.get(CreateReservationUseCase)
        createSeatUseCase = moduleFixture.get(CreateSeatUseCase)
        paymentUserConcertUseCase = moduleFixture.get(PaymentUserConcertUseCase)
    })

    afterAll(async () => {
        await app.close()
    })

    afterEach(async () => {
        await entityManager.delete('reservation', {})
        await entityManager.delete('seat', {})
        await entityManager.delete('concert_date', {})
        await entityManager.delete('concert', {})
        await entityManager.delete('point_history', {})
        await entityManager.delete('user', {})
    })

    const getUserID = async (name: string) => {
        const requestDto = new CreateUserRequestDto(name)
        const result = await createUserUseCase.execute(requestDto)

        expect(result.name).toBe(name)

        return result.id
    }

    const getConcertID = async () => {
        const requestDto = new CreateConcertRequestDto('아이유')
        const result = await createConcertUseCase.execute(requestDto)

        expect(typeof result.id).toBe('string')

        return result.id
    }

    const getConcertDateID = async (concertId: string) => {
        const date = new Date()

        const requestDto = new CreateConcertDateRequestDto(concertId, date)
        const result = await createConcertDateUseCase.execute(requestDto)

        expect(result.concertDate).toEqual(date)

        return result.id
    }

    const getSeatID = async (concertDateId: string, seatNumber: number) => {
        const requestDto = new CreateSeatRequestDto(concertDateId, seatNumber, 1000)

        const result = await createSeatUseCase.execute(requestDto)

        expect(result.status).toBe('available')

        return result.id
    }

    describe('PaymentUserConcertUseCase', () => {
        it('should payment is NotFoundReservationError', async () => {
            const requestDto = new PaymentUserConcertRequestDto('1', '1')
            await expect(paymentUserConcertUseCase.execute(requestDto)).rejects.toThrow(NotFoundReservationError)
        })

        it('should payment is NotFoundReservationError', async () => {
            const userId = await getUserID('tester')
            const requestUserChargeDto = new ChargeUserPointRequestDto(userId, 10000)
            await chargeUserPointUseCase.execute(requestUserChargeDto)

            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)
            const seatId = await getSeatID(concertDateId, 1)

            const requestReservationDto = new CreateReservationRequestDto(seatId, userId)

            const result = await createReservationUseCase.execute(requestReservationDto)

            const requestDto = new PaymentUserConcertRequestDto('1', result.id)
            await expect(paymentUserConcertUseCase.execute(requestDto)).rejects.toThrow(NotFoundUserError)
        })

        it('should payment is NotAuthReservationError', async () => {
            const userId = await getUserID('tester')
            const anotherUserId = await getUserID('tester2')
            const requestUserChargeDto = new ChargeUserPointRequestDto(userId, 10000)
            await chargeUserPointUseCase.execute(requestUserChargeDto)

            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)
            const seatId = await getSeatID(concertDateId, 1)

            const requestReservationDto = new CreateReservationRequestDto(seatId, userId)

            const result = await createReservationUseCase.execute(requestReservationDto)

            const requestDto = new PaymentUserConcertRequestDto(anotherUserId, result.id)
            await expect(paymentUserConcertUseCase.execute(requestDto)).rejects.toThrow(NotAuthReservationError)
        })

        it('should payment is InValidPointError', async () => {
            const userId = await getUserID('tester')

            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)
            const seatId = await getSeatID(concertDateId, 1)

            const requestReservationDto = new CreateReservationRequestDto(seatId, userId)

            const result = await createReservationUseCase.execute(requestReservationDto)

            const requestDto = new PaymentUserConcertRequestDto(userId, result.id)
            await expect(paymentUserConcertUseCase.execute(requestDto)).rejects.toThrow(InValidPointError)
        })

        it('should payment is success', async () => {
            const userId = await getUserID('tester')
            const requestUserChargeDto = new ChargeUserPointRequestDto(userId, 10000)
            await chargeUserPointUseCase.execute(requestUserChargeDto)

            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)
            const seatId = await getSeatID(concertDateId, 1)

            const requestReservationDto = new CreateReservationRequestDto(seatId, userId)

            const resultReservation = await createReservationUseCase.execute(requestReservationDto)

            const requestDto = new PaymentUserConcertRequestDto(userId, resultReservation.id)
            const result = await paymentUserConcertUseCase.execute(requestDto)

            expect(result.userId).toBe(userId)
        })
    })
})
