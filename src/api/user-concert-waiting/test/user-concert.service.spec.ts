import { initConcertReaderMockRepo, initConcertWriterMockRepo } from '../../concert/test/concert.service.mock'
import { initUserWriterMockRepo } from '../../user/test/user.service.mock'
import { NotFoundReservationError } from '../../../domain/user/exceptions/not-found-reservation.exception'
import { InValidPointError } from '../../../domain/user/exceptions/invalid-point.exception'
import { PaymentUserConcertUseCase } from '../../../application/user-concert-waiting/usecase/payment-user-concert.usecase'
import { initWaitingWriterMockRepo } from '../../../api/waiting/test/waiting.service.mock'

describe('유닛 콘서트 서비스 유닛 테스트', () => {
    let mockConcertReaderRepo: ReturnType<typeof initConcertReaderMockRepo>
    let mockConcertWriterRepo: ReturnType<typeof initConcertWriterMockRepo>
    let mockUserWriterRepo: ReturnType<typeof initUserWriterMockRepo>
    let mockWaitingWriterRepo: ReturnType<typeof initWaitingWriterMockRepo>
    let paymentUserConcertUseCase: PaymentUserConcertUseCase

    beforeEach(() => {
        mockConcertReaderRepo = initConcertReaderMockRepo()
        mockUserWriterRepo = initUserWriterMockRepo()
        mockConcertWriterRepo = initConcertWriterMockRepo()
        mockWaitingWriterRepo = initWaitingWriterMockRepo()

        paymentUserConcertUseCase = new PaymentUserConcertUseCase(mockConcertReaderRepo, mockConcertWriterRepo, mockUserWriterRepo, mockWaitingWriterRepo)
    })

    describe('결제 API', () => {
        it('payment is failed cause reservation is not found', async () => {
            mockConcertReaderRepo.findReservationById.mockRejectedValue(new NotFoundReservationError())

            await expect(paymentUserConcertUseCase.excute('1')).rejects.toThrow(NotFoundReservationError)
        })

        it('payment is faild cause user point is not enough', async () => {
            const reservationId = '1'

            mockConcertReaderRepo.findReservationById.mockResolvedValue({ id: reservationId, seat: { id: '1' }, user: { id: '1', point: 100 }, amount: 101 })
            mockUserWriterRepo.calculatePoint.mockRejectedValue(new InValidPointError())

            await expect(paymentUserConcertUseCase.excute(reservationId)).rejects.toThrow(InValidPointError)
        })

        it('Payment is success', async () => {
            const reservationId = '1'

            mockConcertReaderRepo.findReservationById.mockResolvedValue({ id: reservationId, seat: { id: '1' }, user: { id: '1' } })
            mockUserWriterRepo.calculatePoint.mockResolvedValue({ id: '1', user: { id: '1' }, amount: 1, reason: 'payment' })

            const result = await paymentUserConcertUseCase.excute(reservationId)

            expect(result.amount).toBe(1)
        })
    })
})
