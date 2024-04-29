import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from '../../../domain/concert/repositories/concert-writer.repository.interface'
import { IUserWriterRepository, IUserWriterRepositoryToken } from '../../../domain/user/repositories/user-writer.repository.interface'
import { IWaitingWriterRepository, IWaitingWriterRepositoryToken } from '../../../domain/waiting/repositories/waiting-writer.repository.interface'
import { IUserReaderRepository, IUserReaderRepositoryToken } from 'src/domain/user/repositories/user-reader.repository.interface'
import type { IRequestDTO } from 'src/application/common/request.interface'
import type { PaymentUserConcertRequestType } from '../dtos/payment-user-concert.dto'
import { PaymentUserConcertResponseDto } from '../dtos/payment-user-concert.dto'
import { DataAccessor, DataAccessorToken } from 'src/infrastructure/db/data-accesor.interface'

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
        private readonly waitingWriterRepository: IWaitingWriterRepository,
        @Inject(DataAccessorToken)
        private readonly dataAccessor: DataAccessor,
    ) {}

    async execute(requestDto: IRequestDTO<PaymentUserConcertRequestType>): Promise<PaymentUserConcertResponseDto> {
        requestDto.validate()

        const { userId, reservationId, token } = requestDto.toUseCaseInput()

        //예약 정보 조회
        const reservation = await this.concertReaderRepository.findReservationById(reservationId)

        const session = await this.dataAccessor.getSession()

        let pointHistory = null
        try {
            //사용자 조회
            const user = await this.userReaderRepository.findUserById(userId, session)
            //예약 정보의 사용자와 사용자 정보가 일치하는지 확인
            this.concertReaderRepository.checkValidReservation(reservation, userId)
            //결제 진행 및 예약정보에 따른 사용자의 포인트 차감
            pointHistory = await this.userWriterRepository.calculatePoint(user, -reservation.seat.price, reservation.id, session)
        } catch (error) {
            await this.dataAccessor.rollbackTransaction(session)
            throw error
        } finally {
            await this.dataAccessor.releaseQueryRunner(session)
        }

        //예약 정보 수정
        await this.concertWriterRepository.doneReservationPaid(reservation)
        //유효토큰 만료로 변경 수정
        await this.waitingWriterRepository.expiredValidToken(token)

        return new PaymentUserConcertResponseDto(pointHistory.user.id, pointHistory.reservationId, pointHistory.amount, pointHistory.created_at)
    }
}
