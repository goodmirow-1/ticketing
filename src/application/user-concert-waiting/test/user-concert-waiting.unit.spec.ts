import { initConcertReaderMockRepo, initConcertWriterMockRepo } from '../../../domain/concert/test/concert.mock'
import { initUserReaderMockRepo, initUserWriterMockRepo } from '../../../domain/user/test/user.mock'
import { NotFoundReservationError } from '../../../domain/concert/exceptions/not-found-reservation.exception'
import { InValidPointError } from '../../../domain/user/exceptions/invalid-point.exception'
import { PaymentUserConcertUseCase } from '../usecase/payment-user-concert.usecase'
import { initWaitingReaderRedisMockRepo, initWaitingWriterRedisMockRepo } from '../../../domain/user/test/waiting.mock'
import { v4 as uuidv4 } from 'uuid'
import { PaymentUserConcertRequestDto } from 'src/application/user-concert-waiting/dtos/payment-user-concert.dto'
import { initDataAccesorMock } from 'src/infrastructure/db/data-accesor.interface'
import { CreateReservationUseCase } from '../usecase/create-reservation.usecase'
import { ReadAllConcertsUseCase } from '../usecase/read-all-concerts.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from '../usecase/read-all-seats-by-concert-date.usecase'
import { ReadAllConcertsRequestDto } from '../dtos/read-all-concerts.dto'
import { NotFoundConcertError } from 'src/domain/concert/exceptions/not-found-concert.exception'
import { ReadAllSeatsByConcertRequestDto } from '../dtos/read-all-seats-by-concert-date.dto'
import { NotAvailableSeatError } from 'src/domain/concert/exceptions/not-available-seat.exception'
import { NotFoundSeatError } from 'src/domain/concert/exceptions/not-found-seat.exception'
import { CreateReservationRequestDto } from '../dtos/create-reservation.dto'
import { FailedCreateReservationError } from 'src/domain/concert/exceptions/failed-create-reservation.exception'
import { FailedUpdateSeatStatusError } from 'src/domain/concert/exceptions/failed-update-seat-status.exception'

describe('유닛 콘서트 서비스 유닛 테스트', () => {
    let mockConcertReaderRepo: ReturnType<typeof initConcertReaderMockRepo>
    let mockConcertWriterRepo: ReturnType<typeof initConcertWriterMockRepo>
    let mockUserReaderRepo: ReturnType<typeof initUserReaderMockRepo>
    let mockUserWriterRepo: ReturnType<typeof initUserWriterMockRepo>
    let mockWaitingWriterRedisRepo: ReturnType<typeof initWaitingWriterRedisMockRepo>
    let mockWaitingReaderRedisRepo: ReturnType<typeof initWaitingReaderRedisMockRepo>
    let mockDataAccessor: ReturnType<typeof initDataAccesorMock>
    let paymentUserConcertUseCase: PaymentUserConcertUseCase
    let createReservationUseCase: CreateReservationUseCase
    let readAllConcertsUseCase: ReadAllConcertsUseCase
    let readAllSeatsByConcertDateIdUseCase: ReadAllSeatsByConcertDateIdUseCase

    beforeEach(() => {
        mockConcertReaderRepo = initConcertReaderMockRepo()
        mockConcertWriterRepo = initConcertWriterMockRepo()
        mockUserReaderRepo = initUserReaderMockRepo()
        mockUserWriterRepo = initUserWriterMockRepo()
        mockWaitingWriterRedisRepo = initWaitingWriterRedisMockRepo()
        mockWaitingReaderRedisRepo = initWaitingReaderRedisMockRepo()
        mockDataAccessor = initDataAccesorMock()

        paymentUserConcertUseCase = new PaymentUserConcertUseCase(
            mockConcertReaderRepo,
            mockConcertWriterRepo,
            mockUserReaderRepo,
            mockUserWriterRepo,
            mockWaitingWriterRedisRepo,
            mockDataAccessor,
        )

        createReservationUseCase = new CreateReservationUseCase(mockConcertReaderRepo, mockConcertWriterRepo, mockWaitingReaderRedisRepo, mockDataAccessor)
        readAllConcertsUseCase = new ReadAllConcertsUseCase(mockConcertReaderRepo, mockWaitingReaderRedisRepo)
        readAllSeatsByConcertDateIdUseCase = new ReadAllSeatsByConcertDateIdUseCase(mockConcertReaderRepo, mockWaitingReaderRedisRepo)
    })

    describe('콘서트 날짜 조회 API', () => {
        it('ConcertDate findAllConcertsByDate is success', async () => {
            const concertDateId = uuidv4()

            mockConcertReaderRepo.findAllConcerts.mockResolvedValue([{ id: concertDateId, singerName: 'test', concertDates: [] }])

            const reqeustDto = new ReadAllConcertsRequestDto('1')
            const result = await readAllConcertsUseCase.execute(reqeustDto)

            expect(result.concerts[0].singerName).toBe('test')
        })

        it('ConcertDate findSeatsByConcertDate is failed cause concertDateId is NotFound', async () => {
            mockConcertReaderRepo.findSeatsByConcertDateId.mockRejectedValue(new NotFoundConcertError())

            const reqeustDto = new ReadAllSeatsByConcertRequestDto('1', '1')
            await expect(readAllSeatsByConcertDateIdUseCase.execute(reqeustDto)).rejects.toThrow(NotFoundConcertError)
        })

        it('ConcertDate findSeatsByConcertDate is faile cause availableSeats is 0', async () => {
            mockConcertReaderRepo.findSeatsByConcertDateId.mockRejectedValue(new NotAvailableSeatError())

            const reqeustDto = new ReadAllSeatsByConcertRequestDto('1', '1')
            await expect(readAllSeatsByConcertDateIdUseCase.execute(reqeustDto)).rejects.toThrow(NotAvailableSeatError)
        })

        it('ConcertDate findSeatsByConcertDate is success', async () => {
            const seatId = uuidv4()
            const concertDateId = uuidv4()

            mockConcertReaderRepo.findSeatsByConcertDateId.mockResolvedValue([{ id: seatId, concertDate: { id: concertDateId }, seatNumber: 1 }])

            const reqeustDto = new ReadAllSeatsByConcertRequestDto(concertDateId, '1')
            const result = await readAllSeatsByConcertDateIdUseCase.execute(reqeustDto)

            expect(result.seats[0].concertDate.id).toBe(concertDateId)
        })
    })

    describe('예약 생성 API', () => {
        it('Reservation create is failed cause concertDateId is NotFound', async () => {
            mockConcertReaderRepo.findSeatById.mockRejectedValue(new NotFoundSeatError())

            const reqeustDto = new CreateReservationRequestDto('1', '1')
            await expect(createReservationUseCase.execute(reqeustDto)).rejects.toThrow(NotFoundSeatError)
        })

        it('Reservation create is failed cause createReservation is FailedCreateReservation', async () => {
            mockConcertReaderRepo.findSeatById.mockResolvedValue({ id: '1', concertDate: { concert: { id: '1' } } })
            mockConcertWriterRepo.createReservation.mockRejectedValue(new FailedCreateReservationError())

            const reqeustDto = new CreateReservationRequestDto('1', '1')
            await expect(createReservationUseCase.execute(reqeustDto)).rejects.toThrow(FailedCreateReservationError)
        })

        it('Reservation create is failed cause createReservation is FailedUpdateSeatStatus', async () => {
            mockConcertReaderRepo.findSeatById.mockResolvedValue({ id: '1', concertDate: { concert: { id: '1' } } })
            mockConcertWriterRepo.createReservation.mockRejectedValue(new FailedUpdateSeatStatusError())

            const reqeustDto = new CreateReservationRequestDto('1', '1')
            await expect(createReservationUseCase.execute(reqeustDto)).rejects.toThrow(FailedUpdateSeatStatusError)
        })

        it('Reservation create is success', async () => {
            const seatId = '1'
            const userId = '1'
            const reservationId = '1'

            mockConcertReaderRepo.findSeatById.mockResolvedValue({ id: seatId, concertDate: { concert: { id: '1' } } })
            mockConcertWriterRepo.createReservation.mockResolvedValue({ id: reservationId, seat: { id: seatId }, user: { id: userId } })
            mockConcertWriterRepo.updateSeatStatus.mockResolvedValue(true)
            mockConcertWriterRepo.sendReservationInfo.mockResolvedValue(true)
            mockConcertWriterRepo.updateConcertDateAvailableSeat.mockResolvedValue(true)
            mockConcertWriterRepo.addReservationExpireScheduler.mockResolvedValue(true)

            const reqeustDto = new CreateReservationRequestDto(seatId, userId)
            const result = await createReservationUseCase.execute(reqeustDto)

            expect(result.seat.id).toBe(seatId)
        })
    })

    describe('결제 API', () => {
        it('payment is failed cause reservation is not found', async () => {
            const userId = uuidv4()
            const reservationId = uuidv4()

            mockConcertReaderRepo.findReservationById.mockRejectedValue(new NotFoundReservationError())

            const requestDto = new PaymentUserConcertRequestDto(userId, reservationId)
            await expect(paymentUserConcertUseCase.execute(requestDto)).rejects.toThrow(NotFoundReservationError)
        })

        it('payment is faild cause user point is not enough', async () => {
            const userId = uuidv4()
            const reservationId = uuidv4()

            mockConcertReaderRepo.findReservationById.mockResolvedValue({ id: reservationId, seat: { id: '1' }, user: { id: '1', point: 100 }, amount: 101 })
            mockUserReaderRepo.findUserById.mockResolvedValue({ id: '1', name: 'test', point: 0, reservations: [] })
            mockUserWriterRepo.calculatePoint.mockRejectedValue(new InValidPointError())

            const requestDto = new PaymentUserConcertRequestDto(userId, reservationId)
            await expect(paymentUserConcertUseCase.execute(requestDto)).rejects.toThrow(InValidPointError)
        })

        it('Payment is success', async () => {
            const userId = uuidv4()
            const reservationId = uuidv4()

            mockConcertReaderRepo.findReservationById.mockResolvedValue({ id: reservationId, seat: { id: '1' }, user: { id: '1' } })
            mockUserReaderRepo.findUserById.mockResolvedValue({ id: '1', name: 'test', point: 100, reservations: [] })
            mockUserWriterRepo.calculatePoint.mockResolvedValue(true)
            mockUserWriterRepo.createPointHistory.mockResolvedValue({ id: '1', user: { id: '1' }, amount: 1, reason: 'payment' })
            mockConcertWriterRepo.updateSeatStatus.mockResolvedValue(true)
            mockConcertWriterRepo.updateReservationPaymentCompleted.mockResolvedValue(true)
            mockConcertWriterRepo.clearReservationExpireScheduler.mockResolvedValue(true)
            mockWaitingWriterRedisRepo.setExpireToken.mockResolvedValue(true)
            mockConcertWriterRepo.clearReservationExpireScheduler.mockResolvedValue(true)

            const requestDto = new PaymentUserConcertRequestDto(userId, reservationId)
            const result = await paymentUserConcertUseCase.execute(requestDto)

            expect(result.amount).toBe(1)
        })
    })
})
