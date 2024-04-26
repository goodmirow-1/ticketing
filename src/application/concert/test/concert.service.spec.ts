import { v4 as uuidv4 } from 'uuid'
import { initConcertReaderMockRepo, initConcertWriterMockRepo } from '../../../domain/concert/test/concert.mock'
import { CreateConcertUseCase } from '../usecase/create-concert.usecase'
import { CreateConcertDateUseCase } from '../usecase/create-concert-date.usecase'
import { CreateSeatUseCase } from '../usecase/create-seat.usecase'
import { ReadAllSeatsByConcertDateIdUseCase } from '../usecase/read-all-seats-by-concert-date.usecase'
import { ReadAllConcertsUseCase } from '../usecase/read-all-concerts.usecase'
import { CreateReservationUseCase } from '../usecase/create-reservation.usecase'
import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'
import { NotFoundConcertError } from '../../../domain/concert/exceptions/not-found-concert.exception'
import { NotAvailableSeatError } from '../../../domain/concert/exceptions/not-available-seat.exception'
import { NotFoundSeatError } from '../../../domain/concert/exceptions/not-found-seat.exception'
import { FailedCreateReservationError } from '../../../domain/concert/exceptions/failed-create-reservation.exception'
import { FailedUpdateSeatStatusError } from '../../../domain/concert/exceptions/failed-update-seat-status.exception'
import { CreateConcertRequestDto } from 'src/application/concert/dtos/create-concert.dto'
import { CreateConcertDateRequestDto } from 'src/application/concert/dtos/create-concert-date.dto'
import { CreateSeatRequestDto } from 'src/application/concert/dtos/create-seat.dto'
import { ReadAllSeatsByConcertRequestDto } from 'src/application/concert/dtos/read-all-seats-by-concert-date.dto'
import { CreateReservationRequestDto } from 'src/application/concert/dtos/create-reservation.dto'

describe('콘서트 서비스 유닛 테스트', () => {
    let mockReaderRepo: ReturnType<typeof initConcertReaderMockRepo>
    let mockWriterRepo: ReturnType<typeof initConcertWriterMockRepo>
    let createConcertUseCase: CreateConcertUseCase
    let createConcertDateUseCase: CreateConcertDateUseCase
    let createSeatUseCase: CreateSeatUseCase
    let createReservationUseCase: CreateReservationUseCase
    let readAllConcertsUseCase: ReadAllConcertsUseCase
    let readAllSeatsByConcertDateIdUseCase: ReadAllSeatsByConcertDateIdUseCase

    beforeEach(() => {
        mockReaderRepo = initConcertReaderMockRepo()
        mockWriterRepo = initConcertWriterMockRepo()

        createConcertUseCase = new CreateConcertUseCase(mockWriterRepo)
        createConcertDateUseCase = new CreateConcertDateUseCase(mockReaderRepo, mockWriterRepo)
        createSeatUseCase = new CreateSeatUseCase(mockReaderRepo, mockWriterRepo)
        createReservationUseCase = new CreateReservationUseCase(mockReaderRepo, mockWriterRepo)
        readAllConcertsUseCase = new ReadAllConcertsUseCase(mockReaderRepo)
        readAllSeatsByConcertDateIdUseCase = new ReadAllSeatsByConcertDateIdUseCase(mockReaderRepo)
    })

    describe('콘서트 생성 API', () => {
        it('Concert create is success', async () => {
            const concertId = uuidv4()
            const singerName = 'test'

            mockWriterRepo.createConcert.mockResolvedValue({ id: concertId, singerName: singerName, concertDates: [] })

            const requestDto = new CreateConcertRequestDto(singerName)
            const result = await createConcertUseCase.execute(requestDto)

            expect(result.singerName).toBe('test')
        })
    })

    describe('콘서트 날짜 생성 API', () => {
        it('ConcertDate create is failed cause concertId is NotFound', async () => {
            mockReaderRepo.findConcertById.mockRejectedValue(new NotFoundConcertError())

            const reqeustDto = new CreateConcertDateRequestDto('1', new Date())
            await expect(createConcertDateUseCase.execute(reqeustDto)).rejects.toThrow(NotFoundConcertError)
        })

        it('ConcertDate create is failed cause date is duplicate', async () => {
            const concertId = uuidv4()

            mockReaderRepo.checkValidConcertDateByDate.mockRejectedValue(new CustomException(`Concert date is duplicate`, HttpStatus.CONFLICT))

            const reqeustDto = new CreateConcertDateRequestDto(concertId, new Date())
            await expect(createConcertDateUseCase.execute(reqeustDto)).rejects.toThrow(new CustomException('Concert date is duplicate', HttpStatus.CONFLICT))
        })

        it('ConcertDate create is success', async () => {
            const concertId = uuidv4()
            const concertDateId = uuidv4()

            mockReaderRepo.findConcertById.mockResolvedValue({ id: concertId, singerName: 'test', concertDates: [] })
            mockWriterRepo.createConcertDate.mockResolvedValue({ id: concertDateId, concert: { id: concertId }, date: new Date() })

            const reqeustDto = new CreateConcertDateRequestDto(concertId, new Date())
            const result = await createConcertDateUseCase.execute(reqeustDto)

            expect(result.concert.id).toBe(concertId)
        })
    })

    describe('좌석 생성 API', () => {
        it('Seat create is failed cause concertDateId is NotFound', async () => {
            mockReaderRepo.findConcertDateById.mockRejectedValue(new NotFoundConcertError())

            const reqeustDto = new CreateSeatRequestDto('1', 1, 1000)
            await expect(createSeatUseCase.execute(reqeustDto)).rejects.toThrow(NotFoundConcertError)
        })

        it('Seat create is success', async () => {
            const concertDateId = uuidv4()
            const seatId = uuidv4()

            mockReaderRepo.findConcertDateById.mockResolvedValue({ id: concertDateId })
            mockWriterRepo.createSeat.mockResolvedValue({ id: seatId, concertDate: { id: concertDateId }, seatNumber: 1 })

            const reqeustDto = new CreateSeatRequestDto('1', 1, 1000)
            const result = await createSeatUseCase.execute(reqeustDto)

            expect(result.concertDate.id).toBe(concertDateId)
        })
    })

    describe('콘서트 날짜 조회 API', () => {
        it('ConcertDate findAllConcertsByDate is success', async () => {
            const concertDateId = uuidv4()

            mockReaderRepo.findAllConcerts.mockResolvedValue([{ id: concertDateId, singerName: 'test', concertDates: [] }])

            const result = await readAllConcertsUseCase.execute()

            expect(result.concerts[0].singerName).toBe('test')
        })

        it('ConcertDate findSeatsByConcertDate is failed cause concertDateId is NotFound', async () => {
            mockReaderRepo.findSeatsByConcertDateId.mockRejectedValue(new NotFoundConcertError())

            const reqeustDto = new ReadAllSeatsByConcertRequestDto('1')
            await expect(readAllSeatsByConcertDateIdUseCase.execute(reqeustDto)).rejects.toThrow(NotFoundConcertError)
        })

        it('ConcertDate findSeatsByConcertDate is faile cause availableSeats is 0', async () => {
            mockReaderRepo.findSeatsByConcertDateId.mockRejectedValue(new NotAvailableSeatError())

            const reqeustDto = new ReadAllSeatsByConcertRequestDto('1')
            await expect(readAllSeatsByConcertDateIdUseCase.execute(reqeustDto)).rejects.toThrow(NotAvailableSeatError)
        })

        it('ConcertDate findSeatsByConcertDate is success', async () => {
            const seatId = uuidv4()
            const concertDateId = uuidv4()

            mockReaderRepo.findSeatsByConcertDateId.mockResolvedValue([{ id: seatId, concertDate: { id: concertDateId }, seatNumber: 1 }])

            const reqeustDto = new ReadAllSeatsByConcertRequestDto(concertDateId)
            const result = await readAllSeatsByConcertDateIdUseCase.execute(reqeustDto)

            expect(result.seats[0].concertDate.id).toBe(concertDateId)
        })
    })

    describe('예약 생성 API', () => {
        it('Reservation create is failed cause concertDateId is NotFound', async () => {
            mockReaderRepo.findSeatById.mockRejectedValue(new NotFoundSeatError())

            const reqeustDto = new CreateReservationRequestDto('1', '1')
            await expect(createReservationUseCase.execute(reqeustDto)).rejects.toThrow(NotFoundSeatError)
        })

        it('Reservation create is failed cause createReservation is FailedCreateReservation', async () => {
            mockReaderRepo.findSeatById.mockResolvedValue({ id: '1', concertDate: { concert: { id: '1' } } })
            mockWriterRepo.createReservation.mockRejectedValue(new FailedCreateReservationError())

            const reqeustDto = new CreateReservationRequestDto('1', '1')
            await expect(createReservationUseCase.execute(reqeustDto)).rejects.toThrow(FailedCreateReservationError)
        })

        it('Reservation create is failed cause createReservation is FailedUpdateSeatStatus', async () => {
            mockReaderRepo.findSeatById.mockResolvedValue({ id: '1', concertDate: { concert: { id: '1' } } })
            mockWriterRepo.createReservation.mockRejectedValue(new FailedUpdateSeatStatusError())

            const reqeustDto = new CreateReservationRequestDto('1', '1')
            await expect(createReservationUseCase.execute(reqeustDto)).rejects.toThrow(FailedUpdateSeatStatusError)
        })

        it('Reservation create is success', async () => {
            const seatId = '1'
            const userId = '1'
            const reservationId = '1'

            mockReaderRepo.findSeatById.mockResolvedValue({ id: seatId, concertDate: { concert: { id: '1' } } })
            mockWriterRepo.createReservation.mockResolvedValue({ id: reservationId, seat: { id: seatId }, user: { id: userId } })

            const reqeustDto = new CreateReservationRequestDto(seatId, userId)
            const result = await createReservationUseCase.execute(reqeustDto)

            expect(result.seat.id).toBe(seatId)
        })
    })
})
