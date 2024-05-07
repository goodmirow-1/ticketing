import { v4 as uuidv4 } from 'uuid'
import { initConcertReaderMockRepo, initConcertWriterMockRepo } from '../../../domain/concert/test/concert.mock'
import { CreateConcertUseCase } from '../usecase/create-concert.usecase'
import { CreateConcertDateUseCase } from '../usecase/create-concert-date.usecase'
import { CreateSeatUseCase } from '../usecase/create-seat.usecase'
import { HttpStatus } from '@nestjs/common'
import { CustomException } from 'src/custom-exception'
import { NotFoundConcertError } from '../../../domain/concert/exceptions/not-found-concert.exception'
import { CreateConcertRequestDto } from 'src/application/concert/dtos/create-concert.dto'
import { CreateConcertDateRequestDto } from 'src/application/concert/dtos/create-concert-date.dto'
import { CreateSeatRequestDto } from 'src/application/concert/dtos/create-seat.dto'

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
})
