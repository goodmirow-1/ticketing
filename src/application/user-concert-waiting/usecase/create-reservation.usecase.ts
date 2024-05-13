import { Inject, Injectable } from '@nestjs/common'
import { IConcertReaderRepository, IConcertReaderRepositoryToken } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import { IConcertWriterRepository, IConcertWriterRepositoryToken } from '../../../domain/concert/repositories/concert-writer.repository.interface'
import type { IRequestDTO } from 'src/application/common/request.interface'
import type { CreateReservationRequestType } from '../dtos/create-reservation.dto'
import { CreateReservationResponseDto } from '../dtos/create-reservation.dto'
import { IWaitingReaderRedisRepository, IWaitingReaderRepositoryRedisToken } from 'src/domain/user/repositories/waiting-reader-redis.repository.interface'
import { DataAccessor, DataAccessorToken } from 'src/infrastructure/db/data-accesor.interface'

@Injectable()
export class CreateReservationUseCase {
    constructor(
        @Inject(IConcertReaderRepositoryToken)
        private readonly concertReaderRepository: IConcertReaderRepository,
        @Inject(IConcertWriterRepositoryToken)
        private readonly concertWriterRepository: IConcertWriterRepository,
        @Inject(IWaitingReaderRepositoryRedisToken)
        private readonly waitingReaderRepository: IWaitingReaderRedisRepository,
        @Inject(DataAccessorToken)
        private readonly dataAccessor: DataAccessor,
    ) {}

    async execute(requestDto: IRequestDTO<CreateReservationRequestType>): Promise<CreateReservationResponseDto> {
        requestDto.validate()

        const { seatId, userId } = requestDto.toUseCaseInput()
        let reservation = null

        const session = await this.dataAccessor.getSession()

        //토큰 유효성 조회
        await this.waitingReaderRepository.validateUser(userId)

        try {
            //좌석 조회
            const seat = await this.concertReaderRepository.findSeatById(seatId, session, {
                mode: 'pessimistic_write',
            })
            //예약 저장
            reservation = await this.concertWriterRepository.createReservation(seat, userId, session)
            //좌석 상태 변경
            await this.concertWriterRepository.updateSeatStatus(seat.id, 'reserved', session)
            //사용 가능한 좌석수 차감
            await this.concertWriterRepository.updateConcertDateAvailableSeat(seat.concertDate.id, -1, session)
            //예약 정보 전달
            await this.concertWriterRepository.sendReservationInfo()

            await this.dataAccessor.commitTransaction(session)
        } catch (error) {
            await this.dataAccessor.rollbackTransaction(session)
            throw error
        } finally {
            await this.dataAccessor.releaseQueryRunner(session)
        }

        //예약 만료 스케줄러 등록
        await this.concertWriterRepository.addReservationExpireScheduler(reservation)

        return new CreateReservationResponseDto(
            reservation.id,
            reservation.userId,
            reservation.seat,
            reservation.concert,
            reservation.concertDate,
            reservation.holdExpiresAt,
            reservation.paymentCompleted,
        )
    }
}
