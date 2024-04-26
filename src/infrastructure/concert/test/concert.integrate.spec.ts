import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import type { INestApplication } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CreateConcertDateUseCase } from 'src/application/concert/usecase/create-concert-date.usecase'
import { CreateConcertUseCase } from 'src/application/concert/usecase/create-concert.usecase'
import { CreateReservationUseCase } from 'src/application/concert/usecase/create-reservation.usecase'
import { CreateSeatUseCase } from 'src/application/concert/usecase/create-seat.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from 'src/application/concert/usecase/read-all-seats-by-concert-date.usecase'
import { CreateConcertDateRequestDto } from 'src/application/concert/dtos/create-concert-date.dto'
import { CreateConcertRequestDto } from 'src/application/concert/dtos/create-concert.dto'
import { NotFoundConcertError } from 'src/domain/concert/exceptions/not-found-concert.exception'
import { AppModule } from 'src/app.module'
import { DuplicateConcertDateError } from 'src/domain/concert/exceptions/duplicate-concert-date.exception'
import { CreateSeatRequestDto } from 'src/application/concert/dtos/create-seat.dto'
import { InValidSeatNumberError } from 'src/domain/concert/exceptions/invalid-seat-number.exception'
import { InValidPriceError } from 'src/domain/concert/exceptions/invalid-price.exception'
import { NotFoundConcertDateError } from 'src/domain/concert/exceptions/not-found-concert-date.exception'
import { CreateReservationRequestDto } from 'src/application/concert/dtos/create-reservation.dto'
import { v4 as uuidv4 } from 'uuid'
import { NotFoundSeatError } from 'src/domain/concert/exceptions/not-found-seat.exception'
import { ReadAllSeatsByConcertRequestDto } from 'src/application/concert/dtos/read-all-seats-by-concert-date.dto'
import { NotAvailableSeatError } from 'src/domain/concert/exceptions/not-available-seat.exception'

describe('Integration Tests for Concert Use Cases', () => {
    let app: INestApplication
    let entityManager: EntityManager
    let createConcertDateUseCase: CreateConcertDateUseCase
    let createConcertUseCase: CreateConcertUseCase
    let createReservationUseCase: CreateReservationUseCase
    let createSeatUseCase: CreateSeatUseCase
    let readAllSeatsByConcertDateIdUseCase: ReadAllSeatsByConcertDateIdUseCase

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()

        entityManager = moduleFixture.get(EntityManager)
        createConcertUseCase = moduleFixture.get(CreateConcertUseCase)
        createConcertDateUseCase = moduleFixture.get(CreateConcertDateUseCase)
        createReservationUseCase = moduleFixture.get(CreateReservationUseCase)
        createSeatUseCase = moduleFixture.get(CreateSeatUseCase)
        readAllSeatsByConcertDateIdUseCase = moduleFixture.get(ReadAllSeatsByConcertDateIdUseCase)
    })

    afterAll(async () => {
        await app.close()
    })

    afterEach(async () => {
        await entityManager.delete('reservation', {})
        await entityManager.delete('seat', {})
        await entityManager.delete('concert_date', {})
        await entityManager.delete('concert', {})
    })

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

    describe('CreateConcertUseCase', () => {
        it('should create a successfully', async () => {
            const requestDto = new CreateConcertRequestDto('아이유')
            const result = await createConcertUseCase.execute(requestDto)

            expect(typeof result.id).toBe('string')
        })
    })

    describe('CreateConcertDateUseCase', () => {
        it('should create a concert date is NotFoundConcertError', async () => {
            const date = new Date()

            const requestDto = new CreateConcertDateRequestDto('1', date)

            await expect(createConcertDateUseCase.execute(requestDto)).rejects.toThrow(NotFoundConcertError)
        })

        it('should create a concert date is DuplicateConcertDateError', async () => {
            const concertId = await getConcertID()
            const date = new Date()

            const requestDto = new CreateConcertDateRequestDto(concertId, date)
            await createConcertDateUseCase.execute(requestDto)

            await expect(createConcertDateUseCase.execute(requestDto)).rejects.toThrow(DuplicateConcertDateError)
        })

        it('should create a concert date successfully', async () => {
            const concertId = await getConcertID()
            const date = new Date('2023-10-10')

            const requestDto = new CreateConcertDateRequestDto(concertId, date)
            const result = await createConcertDateUseCase.execute(requestDto)

            expect(result.concertDate).toEqual(date)
        })
    })

    describe('CreateSeatUseCase', () => {
        it('should create a seat is InValidSeatNumberError', async () => {
            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)

            const requestDto = new CreateSeatRequestDto(concertDateId, -1, 1000)

            await expect(createSeatUseCase.execute(requestDto)).rejects.toThrow(InValidSeatNumberError)
        })

        it('should create a seat is InValidPriceNumberError', async () => {
            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)

            const requestDto = new CreateSeatRequestDto(concertDateId, 1, 0)

            await expect(createSeatUseCase.execute(requestDto)).rejects.toThrow(InValidPriceError)
        })

        it('should create a seat is NotFoundConcertDateError', async () => {
            const requestDto = new CreateSeatRequestDto('1', 1, 1000)

            await expect(createSeatUseCase.execute(requestDto)).rejects.toThrow(NotFoundConcertDateError)
        })

        it('should create a seat ', async () => {
            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)

            const requestDto = new CreateSeatRequestDto(concertDateId, 1, 1000)

            const result = await createSeatUseCase.execute(requestDto)

            expect(result.status).toBe('available')
        })
    })

    describe('CreateReservationUseCase', () => {
        it('should create a reservation is NotFoundConcertDateError', async () => {
            const requestDto = new CreateReservationRequestDto('1', '1')

            await expect(createReservationUseCase.execute(requestDto)).rejects.toThrow(NotFoundSeatError)
        })

        it('should create a reservation', async () => {
            const uuid = uuidv4()
            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)
            const seatId = await getSeatID(concertDateId, 1)

            const requestDto = new CreateReservationRequestDto(seatId, uuid)

            const result = await createReservationUseCase.execute(requestDto)

            expect(result.userId).toBe(uuid)
            expect(result.seat.status).toBe('reserved')
        })
    })

    describe('ReadAllSeatsByConcertDateIdUseCase', () => {
        it('should read is seats concert NotFoundConcertDateError', async () => {
            const requestDto = new ReadAllSeatsByConcertRequestDto('1')

            await expect(readAllSeatsByConcertDateIdUseCase.execute(requestDto)).rejects.toThrow(NotFoundConcertDateError)
        })

        it('should read is seats concert NotAvailableSeatError', async () => {
            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)

            for (let i = 0; i < parseInt(process.env.MAX_SEATS, 10); i++) {
                const uuid = uuidv4()
                const seatId = await getSeatID(concertDateId, i + 1)
                const requestReservationDto = new CreateReservationRequestDto(seatId, uuid)

                await createReservationUseCase.execute(requestReservationDto)
            }

            const requestDto = new ReadAllSeatsByConcertRequestDto(concertDateId)

            await expect(readAllSeatsByConcertDateIdUseCase.execute(requestDto)).rejects.toThrow(NotAvailableSeatError)
        })

        it('should read a seats is succes', async () => {
            const concertId = await getConcertID()
            const concertDateId = await getConcertDateID(concertId)
            const seatId = await getSeatID(concertDateId, 1)

            const requestDto = new ReadAllSeatsByConcertRequestDto(concertDateId)

            const result = await readAllSeatsByConcertDateIdUseCase.execute(requestDto)

            expect(result.seats[0].id).toBe(seatId)
        })
    })
})
