import type { initDataAccesorMock } from 'src/infrastructure/db/data-accesor.interface'
import { initConcertReaderMockRepo, initConcertWriterMockRepo } from '../concert/business/mocks/concert.service.mock'
import { initUserReaderMockRepo, initUserWriterMockRepo } from '../user/business/mocks/user.service.mock'
import { UserConcertService } from '../application/user-concert.service'
import { NotFoundReservationError } from '../user/business/exceptions/not-found-reservation.exception'
import { InValidPointError } from '../user/business/exceptions/invalid-point.exception'

describe('유닛 콘서트 서비스 유닛 테스트', () => {
    let mockReaderRepo: ReturnType<typeof initConcertReaderMockRepo>
    let mockWriterRepo: ReturnType<typeof initConcertWriterMockRepo>
    let mockUserReaderRepo: ReturnType<typeof initUserReaderMockRepo>
    let mockUserWriterRepo: ReturnType<typeof initUserWriterMockRepo>
    let mockDataAccessor: ReturnType<typeof initDataAccesorMock>
    let userConcertService: UserConcertService

    beforeEach(() => {
        mockReaderRepo = initConcertReaderMockRepo()
        mockWriterRepo = initConcertWriterMockRepo()
        mockUserReaderRepo = initUserReaderMockRepo()
        mockUserWriterRepo = initUserWriterMockRepo()
        userConcertService = new UserConcertService(mockUserReaderRepo, mockUserWriterRepo, mockReaderRepo, mockWriterRepo, mockDataAccessor)
    })

    describe('결제 API', () => {
        it('payment is failed cause reservation is not found', async () => {
            mockReaderRepo.findReservationById.mockRejectedValue(new NotFoundReservationError())

            await expect(userConcertService.payment('1')).rejects.toThrow(NotFoundReservationError)
        })

        it('payment is faild cause user point is not enough', async () => {
            const reservationId = '1'

            mockReaderRepo.findReservationById.mockResolvedValue({ id: reservationId, seat: { id: '1' }, user: { id: '1', point: 100 }, amount: 101 })
            mockUserWriterRepo.calculatePoint.mockRejectedValue(new InValidPointError())

            await expect(userConcertService.payment(reservationId)).rejects.toThrow(InValidPointError)
        })

        it('Payment is success', async () => {
            const reservationId = '1'

            mockReaderRepo.findReservationById.mockResolvedValue({ id: reservationId, seat: { id: '1' }, user: { id: '1' } })
            mockUserWriterRepo.calculatePoint.mockResolvedValue({ id: '1', user: { id: '1' }, amount: 1, reason: 'payment' })

            const result = await userConcertService.payment(reservationId)

            expect(result.amount).toBe(1)
        })
    })
})
