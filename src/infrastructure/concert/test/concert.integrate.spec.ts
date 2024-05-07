import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import type { INestApplication } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CreateConcertDateUseCase } from 'src/application/concert/usecase/create-concert-date.usecase'
import { CreateConcertUseCase } from 'src/application/concert/usecase/create-concert.usecase'
import { CreateSeatUseCase } from 'src/application/concert/usecase/create-seat.usecase'
import { CreateConcertDateRequestDto } from 'src/application/concert/dtos/create-concert-date.dto'
import { CreateConcertRequestDto } from 'src/application/concert/dtos/create-concert.dto'
import { NotFoundConcertError } from 'src/domain/concert/exceptions/not-found-concert.exception'
import { AppModule } from 'src/app.module'
import { DuplicateConcertDateError } from 'src/domain/concert/exceptions/duplicate-concert-date.exception'
import { CreateSeatRequestDto } from 'src/application/concert/dtos/create-seat.dto'
import { InValidSeatNumberError } from 'src/domain/concert/exceptions/invalid-seat-number.exception'
import { InValidPriceError } from 'src/domain/concert/exceptions/invalid-price.exception'
import { NotFoundConcertDateError } from 'src/domain/concert/exceptions/not-found-concert-date.exception'

describe('Integration Tests for Concert Use Cases', () => {
    let app: INestApplication
    let entityManager: EntityManager
    let createConcertDateUseCase: CreateConcertDateUseCase
    let createConcertUseCase: CreateConcertUseCase
    let createSeatUseCase: CreateSeatUseCase

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()

        entityManager = moduleFixture.get(EntityManager)
        createConcertUseCase = moduleFixture.get(CreateConcertUseCase)
        createConcertDateUseCase = moduleFixture.get(CreateConcertDateUseCase)
        createSeatUseCase = moduleFixture.get(CreateSeatUseCase)
    })

    afterAll(async () => {
        await app.close()
    })

    afterEach(async () => {
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
            const date = new Date('1990-12-10')

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
})
