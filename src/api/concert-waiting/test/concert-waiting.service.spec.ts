import { initConcertReaderMockRepo, initConcertWriterMockRepo } from '../../../api/concert/test/concert.service.mock'
import { CreateReservationUseCase } from '../usecase/create-reservation.usecase'
import { ReadAllConcertsUseCase } from '../usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from '../usecase/read-all-seats-by-concert-date.usecase'
import { ReadWaitingUserUseCase } from '../usecase/read-waiting-user.usecase'
import { initWaitingReaderMockRepo } from '../../../api/waiting/test/waiting.service.mock'
import { v4 as uuidv4 } from 'uuid'
import { NotFoundConcertError } from '../../../domain/concert/exceptions/not-found-concert.exception'
import { NotAvailableSeatError } from '../../../domain/concert/exceptions/not-available-seat.exception'
import { NotFoundSeatError } from '../../../domain/concert/exceptions/not-found-seat.exception'
import { FailedCreateReservationError } from '../../../domain/concert/exceptions/failed-create-reservation.exception'
import { FailedUpdateSeatStatusError } from '../../../domain/concert/exceptions/failed-update-seat-status.exception'

describe('콘서트 웨이팅 서비스 유닛 테스트', () => {
    let mockConcertReaderRepo: ReturnType<typeof initConcertReaderMockRepo>
    let mockConcertWriterRepo: ReturnType<typeof initConcertWriterMockRepo>
    let mockWaitingReaderRepo: ReturnType<typeof initWaitingReaderMockRepo>
    let createReservationUseCase: CreateReservationUseCase
    let readAllConcertsUseCase: ReadAllConcertsUseCase
    let readAllSeatsByConcertDateIdUseCase: ReadAllSeatsByConcertDateIdUseCase
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let readWaitingUserUseCase: ReadWaitingUserUseCase

    beforeEach(() => {
        mockConcertReaderRepo = initConcertReaderMockRepo()
        mockConcertWriterRepo = initConcertWriterMockRepo()
        mockWaitingReaderRepo = initWaitingReaderMockRepo()
        createReservationUseCase = new CreateReservationUseCase(mockConcertReaderRepo, mockConcertWriterRepo)
        readAllConcertsUseCase = new ReadAllConcertsUseCase(mockConcertReaderRepo)
        readAllSeatsByConcertDateIdUseCase = new ReadAllSeatsByConcertDateIdUseCase(mockConcertReaderRepo)
        readWaitingUserUseCase = new ReadWaitingUserUseCase(mockWaitingReaderRepo)
    })

    describe('콘서트 날짜 조회 API', () => {
        it('ConcertDate findAllConcertsByDate is success', async () => {
            const concertDateId = uuidv4()

            mockConcertReaderRepo.findAllConcerts.mockResolvedValue([{ id: concertDateId, singerName: 'test', concertDates: [] }])

            const result = await readAllConcertsUseCase.excute()

            expect(result[0].singerName).toBe('test')
        })

        it('ConcertDate findSeatsByConcertDate is failed cause concertDateId is NotFound', async () => {
            mockConcertReaderRepo.findSeatsByConcertDateId.mockRejectedValue(new NotFoundConcertError())

            await expect(readAllSeatsByConcertDateIdUseCase.excute('1')).rejects.toThrow(NotFoundConcertError)
        })

        it('ConcertDate findSeatsByConcertDate is faile cause availableSeats is 0', async () => {
            mockConcertReaderRepo.findSeatsByConcertDateId.mockRejectedValue(new NotAvailableSeatError())

            await expect(readAllSeatsByConcertDateIdUseCase.excute('1')).rejects.toThrow(NotAvailableSeatError)
        })

        it('ConcertDate findSeatsByConcertDate is success', async () => {
            const seatId = uuidv4()
            const concertDateId = uuidv4()

            mockConcertReaderRepo.findSeatsByConcertDateId.mockResolvedValue([{ id: seatId, concertDate: { id: concertDateId }, seatNumber: 1 }])

            const result = await readAllSeatsByConcertDateIdUseCase.excute(concertDateId)

            expect(result[0].concertDate.id).toBe(concertDateId)
        })
    })

    describe('예약 생성 API', () => {
        it('Reservation create is failed cause concertDateId is NotFound', async () => {
            mockConcertReaderRepo.findSeatById.mockRejectedValue(new NotFoundSeatError())

            await expect(createReservationUseCase.excute('1', '1')).rejects.toThrow(NotFoundSeatError)
        })

        it('Reservation create is failed cause createReservation is FailedCreateReservation', async () => {
            mockConcertReaderRepo.findSeatById.mockResolvedValue({ id: '1', concertDate: { concert: { id: '1' } } })
            mockConcertWriterRepo.createReservation.mockRejectedValue(new FailedCreateReservationError())

            await expect(createReservationUseCase.excute('1', '1')).rejects.toThrow(FailedCreateReservationError)
        })

        it('Reservation create is failed cause createReservation is FailedUpdateSeatStatus', async () => {
            mockConcertReaderRepo.findSeatById.mockResolvedValue({ id: '1', concertDate: { concert: { id: '1' } } })
            mockConcertWriterRepo.createReservation.mockRejectedValue(new FailedUpdateSeatStatusError())

            await expect(createReservationUseCase.excute('1', '1')).rejects.toThrow(FailedUpdateSeatStatusError)
        })

        it('Reservation create is success', async () => {
            const seatId = '1'
            const userId = '1'
            const reservationId = '1'

            mockConcertReaderRepo.findSeatById.mockResolvedValue({ id: seatId, concertDate: { concert: { id: '1' } } })
            mockConcertWriterRepo.createReservation.mockResolvedValue({ id: reservationId, seat: { id: seatId }, user: { id: userId } })

            const result = await createReservationUseCase.excute(seatId, userId)

            expect(result.seat.id).toBe(seatId)
            expect(result.user.id).toBe(userId)
        })
    })
})
