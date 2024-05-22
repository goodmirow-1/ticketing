import { HttpStatus, type INestApplication } from '@nestjs/common'
import { PaymentUserConcertUseCase } from '../usecase/payment-user-concert.usecase'
import { EntityManager } from 'typeorm'
import { ChargeUserPointUseCase } from 'src/application/user/usecase/charge-user-point.usecase'
import { CreateConcertDateUseCase } from 'src/application/concert/usecase/create-concert-date.usecase'
import { CreateConcertUseCase } from 'src/application/concert/usecase/create-concert.usecase'
import { CreateReservationUseCase } from 'src/application/user-concert-waiting/usecase/create-reservation.usecase'
import { CreateSeatUseCase } from 'src/application/concert/usecase/create-seat.usecase'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { AppModule } from 'src/app.module'
import { CreateUserUseCase } from 'src/application/user/usecase/create-user.usecase'
import { CreateUserRequestDto } from 'src/application/user/dtos/create-user.dto'
import { CreateConcertRequestDto } from 'src/application/concert/dtos/create-concert.dto'
import { CreateConcertDateRequestDto } from 'src/application/concert/dtos/create-concert-date.dto'
import { CreateSeatRequestDto } from 'src/application/concert/dtos/create-seat.dto'
import { CreateReservationRequestDto } from 'src/application/user-concert-waiting/dtos/create-reservation.dto'
import { PaymentUserConcertRequestDto } from '../dtos/payment-user-concert.dto'
import { ChargeUserPointRequestDto } from 'src/application/user/dtos/charge-user-point.dto'
import { NotFoundReservationError } from 'src/domain/concert/exceptions/not-found-reservation.exception'
import { NotFoundUserError } from 'src/domain/user/exceptions/not-found-user.exception'
import { NotAuthReservationError } from 'src/domain/concert/exceptions/not-auth-reservation.exception'
import { InValidPointError } from 'src/domain/user/exceptions/invalid-point.exception'
import { NotFoundSeatError } from 'src/domain/concert/exceptions/not-found-seat.exception'
import { ReadAllSeatsByConcertRequestDto } from '../dtos/read-all-seats-by-concert-date.dto'
import { NotFoundConcertDateError } from 'src/domain/concert/exceptions/not-found-concert-date.exception'
import { NotAvailableSeatError } from 'src/domain/concert/exceptions/not-available-seat.exception'
import { ReadAllSeatsByConcertDateIdUseCase } from '../usecase/read-all-seats-by-concert-date.usecase'
import { GenerateTokenUseCase } from 'src/application/user/usecase/generate-token.usecase'
import { GenerateTokenRequestDto } from 'src/application/user/dtos/generate-token.dto'
import { ReadAllConcertsUseCase } from '../usecase/read-all-concerts.usecase'
import { ReadAllConcertsRequestDto } from '../dtos/read-all-concerts.dto'
import { CustomException } from 'src/custom-exception'
import { ReadUserPointUseCase } from 'src/application/user/usecase/read-user-point.usecase'
import { ReadUserPointRequestDto } from 'src/application/user/dtos/read-user-point.dto'
import { RedisService } from 'src/infrastructure/db/redis/redis-service'
import { WaitingSchedulerUseCase } from 'src/application/user/usecase/waiting-scheduler.usecase'
import { CheckWaitingUseCase } from 'src/application/user/usecase/check-waiting.usecase'
import { CheckWaitingRequestDto } from 'src/application/user/dtos/check-waiting.dto'

describe('Integration Tests for User Use Cases', () => {
    let app: INestApplication
    let entityManager: EntityManager
    let createUserUseCase: CreateUserUseCase
    let chargeUserPointUseCase: ChargeUserPointUseCase
    let readUserPointUseCase: ReadUserPointUseCase
    let createConcertDateUseCase: CreateConcertDateUseCase
    let createConcertUseCase: CreateConcertUseCase
    let createReservationUseCase: CreateReservationUseCase
    let createSeatUseCase: CreateSeatUseCase
    let paymentUserConcertUseCase: PaymentUserConcertUseCase
    let readAllSeatsByConcertDateIdUseCase: ReadAllSeatsByConcertDateIdUseCase
    let readAllConcertsUseCase: ReadAllConcertsUseCase
    let generateTokenUseCase: GenerateTokenUseCase
    let checkWaitingUseCase: CheckWaitingUseCase
    let waitingSchedulerUseCase: WaitingSchedulerUseCase
    let redisService: RedisService

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()

        entityManager = moduleFixture.get(EntityManager)
        redisService = moduleFixture.get(RedisService)
        createUserUseCase = moduleFixture.get(CreateUserUseCase)
        chargeUserPointUseCase = moduleFixture.get(ChargeUserPointUseCase)
        readUserPointUseCase = moduleFixture.get(ReadUserPointUseCase)
        createConcertDateUseCase = moduleFixture.get(CreateConcertDateUseCase)
        createConcertUseCase = moduleFixture.get(CreateConcertUseCase)
        createReservationUseCase = moduleFixture.get(CreateReservationUseCase)
        createSeatUseCase = moduleFixture.get(CreateSeatUseCase)
        paymentUserConcertUseCase = moduleFixture.get(PaymentUserConcertUseCase)
        readAllConcertsUseCase = moduleFixture.get(ReadAllConcertsUseCase)
        readAllSeatsByConcertDateIdUseCase = moduleFixture.get(ReadAllSeatsByConcertDateIdUseCase)
        generateTokenUseCase = moduleFixture.get(GenerateTokenUseCase)
        checkWaitingUseCase = moduleFixture.get(CheckWaitingUseCase)
        waitingSchedulerUseCase = moduleFixture.get(WaitingSchedulerUseCase)
    })

    afterAll(async () => {
        await app.close()
    })

    afterEach(async () => {
        await redisService.clearAllData()
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

    const generateToken = async (userId: string) => {
        const requestDtoOne = new GenerateTokenRequestDto(userId)
        await generateTokenUseCase.execute(requestDtoOne)

        await waitingSchedulerUseCase.handleWaitingUser()

        const requestDtoTwo = new CheckWaitingRequestDto(userId)
        const result = await checkWaitingUseCase.execute(requestDtoTwo)
        expect(result.waitingNumber).toBe(0)
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

    describe('ReadAllConcertsUseCase', () => {
        it('should read a concerts is Forbidden', async () => {
            const requestDto = new ReadAllConcertsRequestDto('1') // 예제에서 '1'은 사용자 ID

            // `readAllConcertsUseCase.execute`가 Forbidden 예외를 던지는지 검증
            await expect(readAllConcertsUseCase.execute(requestDto)).rejects.toThrow(new CustomException('Forbidden resource', HttpStatus.FORBIDDEN))
        })

        it('should read a concerts is Forbidden', async () => {
            const userId = await getUserID('tester')
            await generateToken(userId)

            const requestDto = new ReadAllConcertsRequestDto(userId)

            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)

            const result = await readAllConcertsUseCase.execute(requestDto)

            expect(result.concerts[0].concertDates[0].id).toBe(concertDateId)
        })
    })

    describe('ReadAllSeatsByConcertDateIdUseCase', () => {
        it('should read is seats concert NotFoundConcertDateError', async () => {
            const userId = await getUserID('tester')
            await generateToken(userId)

            const requestDto = new ReadAllSeatsByConcertRequestDto('1', userId)

            await expect(readAllSeatsByConcertDateIdUseCase.execute(requestDto)).rejects.toThrow(NotFoundConcertDateError)
        })

        it(
            'should read is seats concert NotAvailableSeatError',
            async () => {
                const concertId = await getConcertID()
                const concertDateId = await getConcertDateID(concertId)

                for (let i = 0; i < parseInt(process.env.MAX_SEATS, 10); i++) {
                    const userId = await getUserID('tester')
                    await generateToken(userId)

                    const requestUserChargeDto = new ChargeUserPointRequestDto(userId, 10000)
                    await chargeUserPointUseCase.execute(requestUserChargeDto)

                    const seatId = await getSeatID(concertDateId, i + 1)
                    const requestReservationDto = new CreateReservationRequestDto(seatId, userId)

                    const resultReservation = await createReservationUseCase.execute(requestReservationDto)

                    const requestDto = new PaymentUserConcertRequestDto(userId, resultReservation.id)
                    await paymentUserConcertUseCase.execute(requestDto)
                }

                const userId = await getUserID('tester')
                await generateToken(userId)
                const requestDto = new ReadAllSeatsByConcertRequestDto(concertDateId, userId)

                await expect(readAllSeatsByConcertDateIdUseCase.execute(requestDto)).rejects.toThrow(NotAvailableSeatError)
            },
            6000 * 1000,
        )

        it('should read a seats is succes', async () => {
            const userId = await getUserID('tester')
            await generateToken(userId)

            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)
            const seatId = await getSeatID(concertDateId, 1)

            const requestDto = new ReadAllSeatsByConcertRequestDto(concertDateId, userId)

            const result = await readAllSeatsByConcertDateIdUseCase.execute(requestDto)

            expect(result.seats[0].id).toBe(seatId)
        })
    })

    describe('CreateReservationUseCase', () => {
        it('should create a reservation is NotFoundConcertDateError', async () => {
            const userId = await getUserID('tester')
            await generateToken(userId)

            const requestDto = new CreateReservationRequestDto('1', userId)

            await expect(createReservationUseCase.execute(requestDto)).rejects.toThrow(NotFoundSeatError)
        })

        it('should create a reservation', async () => {
            const userId = await getUserID('tester')
            await generateToken(userId)

            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)
            const seatId = await getSeatID(concertDateId, 1)

            const requestDto = new CreateReservationRequestDto(seatId, userId)

            const result = await createReservationUseCase.execute(requestDto)

            expect(result.userId).toBe(userId)
            expect(result.seat.status).toBe('reserved')
        })
    })

    describe('PaymentUserConcertUseCase', () => {
        it('should payment is NotFoundReservationError', async () => {
            const requestDto = new PaymentUserConcertRequestDto('1', '1')
            await expect(paymentUserConcertUseCase.execute(requestDto)).rejects.toThrow(NotFoundReservationError)
        })

        it('should payment is NotFoundReservationError', async () => {
            const userId = await getUserID('tester')
            await generateToken(userId)

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
            await generateToken(userId)

            const anotherUserId = await getUserID('tester2')
            await generateToken(anotherUserId)
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
            await generateToken(userId)

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
            await generateToken(userId)

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

    describe('Concurrent Execution of Charge and Payment', () => {
        it('should accurately deduct points when a charge and payment are processed simultaneously', async () => {
            // Setup initial user and point balance
            const userId = await getUserID('tester')
            await generateToken(userId)

            // Initially charge the user points
            const initialChargeDto = new ChargeUserPointRequestDto(userId, 20000)
            await chargeUserPointUseCase.execute(initialChargeDto)

            // Prepare the payment process
            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)
            const seatId = await getSeatID(concertDateId, 1)
            const reservationDto = new CreateReservationRequestDto(seatId, userId)
            const reservationResult = await createReservationUseCase.execute(reservationDto)
            const paymentDto = new PaymentUserConcertRequestDto(userId, reservationResult.id)

            // Prepare another charge operation
            const additionalChargeDto = new ChargeUserPointRequestDto(userId, 10000)

            // Execute both operations simultaneously
            await Promise.all([
                chargeUserPointUseCase.execute(additionalChargeDto), // This should charge the user
                paymentUserConcertUseCase.execute(paymentDto), // This should deduct from the user's points
            ])

            // Check results
            const finalPointStatus = await readUserPointUseCase.execute(new ReadUserPointRequestDto(userId))
            const expectedPointsAfterTransactions = 20000 + 10000 - reservationResult.seat.price // adjust logic based on your actual cost deduction logic

            expect(finalPointStatus.point).toBe(expectedPointsAfterTransactions)
        })
    })
})
