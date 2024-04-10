import { v4 as uuidv4 } from 'uuid'
import { initConcertReaderMockRepo, initConcertWriterMockRepo } from './concert.service.mock'
import { NotFoundConcertError } from '../../../domain/concert/exceptions/not-found-concert.exception'
import { DuplicateConcertDateError } from '../../../domain/concert/exceptions/duplicate-concert-date.exception'
import { CreateConcertUseCase } from '../../../application/concert/usecase/create-concert.usecase'
import { CreateConcertDateUseCase } from '../../../application/concert/usecase/create-concert-date.usecase'
import { CreateSeatUseCase } from '../../../application/concert/usecase/create-seat.usecase'

describe('콘서트 서비스 유닛 테스트', () => {
    let mockReaderRepo: ReturnType<typeof initConcertReaderMockRepo>
    let mockWriterRepo: ReturnType<typeof initConcertWriterMockRepo>
    let createConcertUseCase: CreateConcertUseCase
    let createConcertDateUseCase: CreateConcertDateUseCase
    let createSeatUseCase: CreateSeatUseCase

    beforeEach(() => {
        mockReaderRepo = initConcertReaderMockRepo()
        mockWriterRepo = initConcertWriterMockRepo()

        createConcertUseCase = new CreateConcertUseCase(mockWriterRepo)
        createConcertDateUseCase = new CreateConcertDateUseCase(mockReaderRepo, mockWriterRepo)
        createSeatUseCase = new CreateSeatUseCase(mockReaderRepo, mockWriterRepo)
    })

    describe('콘서트 생성 API', () => {
        it('Concert create is success', async () => {
            const concertId = uuidv4()

            mockWriterRepo.createConcert.mockResolvedValue({ id: concertId, singerName: 'test', concertDates: [] })

            const result = await createConcertUseCase.excute('test')

            expect(result.singerName).toBe('test')
        })
    })

    describe('콘서트 날짜 생성 API', () => {
        it('ConcertDate create is failed cause concertId is NotFound', async () => {
            mockReaderRepo.findConcertById.mockRejectedValue(new NotFoundConcertError())

            await expect(createConcertDateUseCase.excute('1', new Date())).rejects.toThrow(NotFoundConcertError)
        })

        it('ConcertDate create is failed cause date is duplicate', async () => {
            const concertId = uuidv4()

            mockWriterRepo.createConcertDate.mockRejectedValue(new DuplicateConcertDateError())

            await expect(createConcertDateUseCase.excute(concertId, new Date())).rejects.toThrow(DuplicateConcertDateError)
        })

        it('ConcertDate create is success', async () => {
            const concertId = uuidv4()
            const concertDateId = uuidv4()

            mockReaderRepo.findConcertById.mockResolvedValue({ id: concertId, singerName: 'test', concertDates: [] })
            mockWriterRepo.createConcertDate.mockResolvedValue({ id: concertDateId, concert: { id: concertId }, date: new Date() })

            const result = await createConcertDateUseCase.excute(concertId, new Date())

            expect(result.concert.id).toBe(concertId)
        })
    })

    describe('좌석 생성 API', () => {
        it('Seat create is failed cause concertDateId is NotFound', async () => {
            mockReaderRepo.findConcertDateById.mockRejectedValue(new NotFoundConcertError())

            await expect(createSeatUseCase.excute('1', 1)).rejects.toThrow(NotFoundConcertError)
        })

        it('Seat create is success', async () => {
            const concertDateId = uuidv4()
            const seatId = uuidv4()

            mockReaderRepo.findConcertDateById.mockResolvedValue({ id: concertDateId })
            mockWriterRepo.createSeat.mockResolvedValue({ id: seatId, concertDate: { id: concertDateId }, seatNumber: 1 })

            const result = await createSeatUseCase.excute(concertDateId, 1)

            expect(result.concertDate.id).toBe(concertDateId)
        })
    })
})
