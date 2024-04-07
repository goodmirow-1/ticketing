import type { initDataAccesorMock } from 'src/infrastructure/db/data-accesor.interface'
import { v4 as uuidv4 } from 'uuid'
import { initConcertReaderMockRepo, initConcertWriterMockRepo } from '../concert/business/mocks/concert.service.mock'
import { ConcertService } from '../concert/business/service/concert.service'
import { NotFoundConcertError } from '../concert/business/exceptions/not-found-concert.exception'
import { DuplicateConcertDateError } from '../concert/business/exceptions/duplicate-concert-date.exception'

describe('콘서트 서비스 유닛 테스트', () => {
    let mockReaderRepo: ReturnType<typeof initConcertReaderMockRepo>
    let mockWriterRepo: ReturnType<typeof initConcertWriterMockRepo>
    let mockDataAccessor: ReturnType<typeof initDataAccesorMock>
    let service: ConcertService

    beforeEach(() => {
        mockReaderRepo = initConcertReaderMockRepo()
        mockWriterRepo = initConcertWriterMockRepo()
        service = new ConcertService(mockReaderRepo, mockWriterRepo, mockDataAccessor)
    })

    describe('콘서트 생성 API', () => {
        it('Concert create is success', async () => {
            const concertId = uuidv4()

            mockWriterRepo.createConcert.mockResolvedValue({ id: concertId, singerName: 'test', concertDates: [] })

            const result = await service.createConcert('test')

            expect(result.singerName).toBe('test')
        })
    })

    describe('콘서트 날짜 생성 API', () => {
        it('ConcertDate create is failed cause concertId is NotFound', async () => {
            mockReaderRepo.findConcertById.mockRejectedValue(new NotFoundConcertError())

            await expect(service.createConcertDate('1', new Date())).rejects.toThrow(NotFoundConcertError)
        })

        it('ConcertDate create is failed cause date is duplicate', async () => {
            const concertId = uuidv4()

            mockWriterRepo.createConcertDate.mockRejectedValue(new DuplicateConcertDateError())

            await expect(service.createConcertDate(concertId, new Date())).rejects.toThrow(DuplicateConcertDateError)
        })

        it('ConcertDate create is success', async () => {
            const concertId = uuidv4()
            const concertDateId = uuidv4()

            mockReaderRepo.findConcertById.mockResolvedValue({ id: concertId, singerName: 'test', concertDates: [] })
            mockWriterRepo.createConcertDate.mockResolvedValue({ id: concertDateId, concert: { id: concertId }, date: new Date() })

            const result = await service.createConcertDate(concertId, new Date())

            expect(result.concert.id).toBe(concertId)
        })
    })
})
