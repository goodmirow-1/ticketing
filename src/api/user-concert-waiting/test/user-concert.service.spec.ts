import { initConcertReaderMockRepo, initConcertWriterMockRepo } from '../../concert/test/concert.service.mock'
import { initUserReaderMockRepo, initUserWriterMockRepo } from '../../user/test/user.service.mock'
import { NotFoundReservationError } from '../../../domain/user/exceptions/not-found-reservation.exception'
import { InValidPointError } from '../../../domain/user/exceptions/invalid-point.exception'
import { PaymentUserConcertUseCase } from '../../../application/user-concert-waiting/usecase/payment-user-concert.usecase'
import { initWaitingWriterMockRepo } from '../../../api/waiting/test/waiting.service.mock'
import { v4 as uuidv4 } from 'uuid'

describe('유닛 콘서트 서비스 유닛 테스트', () => {
    let mockConcertReaderRepo: ReturnType<typeof initConcertReaderMockRepo>
    let mockConcertWriterRepo: ReturnType<typeof initConcertWriterMockRepo>
    let mockUserReaderRepo: ReturnType<typeof initUserReaderMockRepo>
    let mockUserWriterRepo: ReturnType<typeof initUserWriterMockRepo>
    let mockWaitingWriterRepo: ReturnType<typeof initWaitingWriterMockRepo>
    let paymentUserConcertUseCase: PaymentUserConcertUseCase

    beforeEach(() => {
        mockConcertReaderRepo = initConcertReaderMockRepo()
        mockConcertWriterRepo = initConcertWriterMockRepo()
        mockUserReaderRepo = initUserReaderMockRepo()
        mockUserWriterRepo = initUserWriterMockRepo()
        mockWaitingWriterRepo = initWaitingWriterMockRepo()

        paymentUserConcertUseCase = new PaymentUserConcertUseCase(
            mockConcertReaderRepo,
            mockConcertWriterRepo,
            mockUserReaderRepo,
            mockUserWriterRepo,
            mockWaitingWriterRepo,
        )
    })

    describe('결제 API', () => {
        it('payment is failed cause reservation is not found', async () => {
            const userId = uuidv4()
            const reservationId = uuidv4()

            mockConcertReaderRepo.findReservationById.mockRejectedValue(new NotFoundReservationError())

            await expect(paymentUserConcertUseCase.excute(userId, reservationId)).rejects.toThrow(NotFoundReservationError)
        })

        it('payment is faild cause user point is not enough', async () => {
            const userId = uuidv4()
            const reservationId = uuidv4()

            mockConcertReaderRepo.findReservationById.mockResolvedValue({ id: reservationId, seat: { id: '1' }, user: { id: '1', point: 100 }, amount: 101 })
            mockUserReaderRepo.findUserById.mockResolvedValue({ id: '1', name: 'test', point: 0, reservations: [] })
            mockUserWriterRepo.calculatePoint.mockRejectedValue(new InValidPointError())

            await expect(paymentUserConcertUseCase.excute(userId, reservationId)).rejects.toThrow(InValidPointError)
        })

        it('Payment is success', async () => {
            const userId = uuidv4()
            const reservationId = uuidv4()

            mockConcertReaderRepo.findReservationById.mockResolvedValue({ id: reservationId, seat: { id: '1' }, user: { id: '1' } })
            mockUserReaderRepo.findUserById.mockResolvedValue({ id: '1', name: 'test', point: 100, reservations: [] })
            mockUserWriterRepo.calculatePoint.mockResolvedValue({ id: '1', user: { id: '1' }, amount: 1, reason: 'payment' })

            const result = await paymentUserConcertUseCase.excute(userId, reservationId)

            expect(result.amount).toBe(1)
        })
    })

    it('test', () => {
        expect(1).toBe(2)
    })
})
