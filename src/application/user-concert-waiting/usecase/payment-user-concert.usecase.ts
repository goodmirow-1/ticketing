import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import { IUserWriterRepository, IUserWriterRepositoryToken } from '../../../domain/user/repositories/user-writer.repository.interface'
import { IUserReaderRepository, IUserReaderRepositoryToken } from 'src/domain/user/repositories/user-reader.repository.interface'
import type { IRequestDTO } from 'src/application/common/request.interface'
import type { PaymentUserConcertRequestType } from '../dtos/payment-user-concert.dto'
import { PaymentUserConcertResponseDto } from '../dtos/payment-user-concert.dto'
import { DataAccessor, DataAccessorToken } from 'src/infrastructure/db/data-accesor.interface'
import { IWaitingWriterRepository, IWaitingWriterRepositoryToken } from 'src/domain/user/repositories/waiting-writer.repository.interface'
import { EventPublisher } from '../event/event-publisher'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from 'src/domain/concert/repositories/concert-writer.repository.interface'
import { PaymentCompleteEvent } from 'src/application/user-concert-waiting/event/payment-complete.event'
import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'

@Injectable()
export class PaymentUserConcertUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
        @Inject(IUserReaderRepositoryToken)
        private readonly userReaderRepository: IUserReaderRepository,
        @Inject(IUserWriterRepositoryToken)
        private readonly userWriterRepository: IUserWriterRepository,
        @Inject(IWaitingWriterRepositoryToken)
        private readonly waitingWriterRedisRepository: IWaitingWriterRepository,
        @Inject(DataAccessorToken)
        private readonly dataAccessor: DataAccessor,
        private readonly eventPublisher: EventPublisher,
    ) {}

    async execute(requestDto: IRequestDTO<PaymentUserConcertRequestType>): Promise<PaymentUserConcertResponseDto> {
        requestDto.validate()

        const { userId, reservationId } = requestDto.toUseCaseInput()
        let reservation: IReservation = null

        let lock: any

        try {
            lock = await this.userReaderRepository.acquireLock(userId)
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            const session = await this.dataAccessor.getSession()
            try {
                //예약 정보 조회
                reservation = await this.concertReaderRepository.findReservationById(reservationId, session)
                //사용자 조회
                const user = await this.userReaderRepository.findUserById(userId, session)

                //예약 정보의 사용자와 사용자 정보가 일치하는지 확인
                this.concertReaderRepository.checkValidReservation(reservation, userId)
                //결제 진행(예약정보에 따른 사용자의 포인트 차감)
                await this.userWriterRepository.calculatePoint(user, -reservation.seat.price, 'payment', session)
                //결제 내역 저장
                await this.userWriterRepository.createPointHistory(user, -reservation.seat.price, reservation.id, session)
                //좌석 상태 변경
                await this.concertWriterRepository.updateSeatStatus(reservation.seat.id, 'held', session)
                //예약 상태 변경
                await this.concertWriterRepository.updateReservationPaymentCompleted(reservation.id, session)
                //결제 성공 이벤트 발행
                await this.eventPublisher.paymentCompetePublish(new PaymentCompleteEvent(user, reservation))

                await this.dataAccessor.commitTransaction(session)
            } catch (error) {
                await this.dataAccessor.rollbackTransaction(session)
                throw error
            } finally {
                await this.dataAccessor.releaseQueryRunner(session)
                await this.userReaderRepository.releaseLock(lock)
            }

            //유효토큰 만료로 변경 수정
            await this.waitingWriterRedisRepository.setExpireToken(userId)

            return new PaymentUserConcertResponseDto(reservation.userId, reservation.id, reservation.seat.price, new Date())
        }
    }
}
