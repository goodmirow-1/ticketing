import type { initDataAccesorMock } from 'src/infrastructure/db/data-accesor.interface'
import { v4 as uuidv4 } from 'uuid'
import { initConcertReaderMockRepo, initConcertWriterMockRepo } from '../concert/business/mocks/concert.service.mock'
import { ConcertService } from '../concert/business/service/concert.service'
import { NotFoundConcertError } from '../concert/business/exceptions/not-found-concert.exception'
import { DuplicateConcertDateError } from '../concert/business/exceptions/duplicate-concert-date.exception'
import { NotAvailableSeatError } from '../concert/business/exceptions/not-available-seat.exception'
import { FailedUpdateSeatStatusError } from '../concert/business/exceptions/failed-update-seat-status.exception'
import { FailedCreateReservationError } from '../concert/business/exceptions/failed-create-reservation.exception'
import { NotFoundSeatError } from '../concert/business/exceptions/not-found-seat.exception'

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

    describe('콘서트 날짜 조회 API', () => {
        it('ConcertDate findAllConcertsByDate is success', async () => {
            const concertDateId = uuidv4()

            mockReaderRepo.findAllConcertsByDate.mockResolvedValue([{ id: concertDateId, singerName: 'test', concertDates: [] }])

            const result = await service.findAllConcertsByDate()

            expect(result[0].singerName).toBe('test')
        })

        it('ConcertDate findSeatsByConcertDate is failed cause concertDateId is NotFound', async () => {
            mockReaderRepo.findSeatsByConcertDate.mockRejectedValue(new NotFoundConcertError())

            await expect(service.findSeatsByConcertDate('1')).rejects.toThrow(NotFoundConcertError)
        })

        it('ConcertDate findSeatsByConcertDate is faile cause availableSeats is 0', async () => {
            mockReaderRepo.findSeatsByConcertDate.mockRejectedValue(new NotAvailableSeatError())

            await expect(service.findSeatsByConcertDate('1')).rejects.toThrow(NotAvailableSeatError)
        })

        it('ConcertDate findSeatsByConcertDate is success', async () => {
            const seatId = uuidv4()
            const concertDateId = uuidv4()

            mockReaderRepo.findSeatsByConcertDate.mockResolvedValue([{ id: seatId, concertDate: { id: concertDateId }, seatNumber: 1 }])

            const result = await service.findSeatsByConcertDate(concertDateId)

            expect(result[0].concertDate.id).toBe(concertDateId)
        })
    })

    describe('좌석 생성 API', () => {
        it('Seat create is failed cause concertDateId is NotFound', async () => {
            mockReaderRepo.findConcertDateById.mockRejectedValue(new NotFoundConcertError())

            await expect(service.createSeat('1', 1)).rejects.toThrow(NotFoundConcertError)
        })

        it('Seat create is success', async () => {
            const concertDateId = uuidv4()
            const seatId = uuidv4()

            mockReaderRepo.findConcertDateById.mockResolvedValue({ id: concertDateId })
            mockWriterRepo.createSeat.mockResolvedValue({ id: seatId, concertDate: { id: concertDateId }, seatNumber: 1 })

            const result = await service.createSeat(concertDateId, 1)

            expect(result.concertDate.id).toBe(concertDateId)
        })
    })

    describe('예약 생성 API', () => {
        it('Reservation create is failed cause concertDateId is NotFound', async () => {
            mockReaderRepo.findSeatById.mockRejectedValue(new NotFoundSeatError())

            await expect(service.createReservation('1', '1')).rejects.toThrow(NotFoundSeatError)
        })

        it('Reservation create is failed cause createReservation is FailedCreateReservation', async () => {
            mockReaderRepo.findSeatById.mockResolvedValue({ id: '1', concertDate: { concert: { id: '1' } } })
            mockWriterRepo.createReservation.mockRejectedValue(new FailedCreateReservationError())

            await expect(service.createReservation('1', '1')).rejects.toThrow(FailedCreateReservationError)
        })

        it('Reservation create is failed cause createReservation is FailedUpdateSeatStatus', async () => {
            mockReaderRepo.findSeatById.mockResolvedValue({ id: '1', concertDate: { concert: { id: '1' } } })
            mockWriterRepo.createReservation.mockRejectedValue(new FailedUpdateSeatStatusError())

            await expect(service.createReservation('1', '1')).rejects.toThrow(FailedUpdateSeatStatusError)
        })

        it('Reservation create is success', async () => {
            const seatId = '1'
            const userId = '1'
            const reservationId = '1'

            mockReaderRepo.findSeatById.mockResolvedValue({ id: seatId, concertDate: { concert: { id: '1' } } })
            mockWriterRepo.createReservation.mockResolvedValue({ id: reservationId, seat: { id: seatId }, user: { id: userId } })

            const result = await service.createReservation(seatId, userId)

            expect(result.seat.id).toBe(seatId)
            expect(result.user.id).toBe(userId)
        })
    })
})
