import { Inject, Injectable } from '@nestjs/common'
import { IUserReaderRepository, IUserReaderRepositoryToken } from '../../../domain/user/repositories/user-reader.repository.interface'
import { IUserWriterRepository, IUserWriterRepositoryToken } from '../../../domain/user/repositories/user-writer.repository.interface'
import { DataAccessor, DataAccessorToken } from '../../../infrastructure/db/data-accesor.interface'
import type { ChargeUserPointRequestType } from '../dtos/charge-user-point.dto'
import { ChargeUserPointResponseDto } from '../dtos/charge-user-point.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'

@Injectable()
export class ChargeUserPointUseCase {
    constructor(
        @Inject(IUserReaderRepositoryToken)
        private readonly userReaderRepository: IUserReaderRepository,
        @Inject(IUserWriterRepositoryToken)
        private readonly userWriterRepository: IUserWriterRepository,
        @Inject(DataAccessorToken)
        private readonly dataAccessor: DataAccessor,
    ) {}

    async execute(requestDto: IRequestDTO<ChargeUserPointRequestType>): Promise<ChargeUserPointResponseDto> {
        requestDto.validate()

        const { userId, amount } = requestDto.toUseCaseInput()

        let lock: any

        try {
            lock = await this.userReaderRepository.acquireLock(userId)
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            const session = await this.dataAccessor.getSession()

            try {
                //유저 정보 조회
                const user = await this.userReaderRepository.findUserById(userId, session)
                //포인트 충전
                await this.userWriterRepository.calculatePoint(user, amount, 'charge', session)
                //충전 로그 저장
                const pointHistory = await this.userWriterRepository.createPointHistory(user, amount, null, session)

                await this.dataAccessor.commitTransaction(session)

                return new ChargeUserPointResponseDto(pointHistory.amount)
            } catch (error) {
                await this.dataAccessor.rollbackTransaction(session)
                throw error
            } finally {
                await this.dataAccessor.releaseQueryRunner(session)
                await this.userReaderRepository.releaseLock(lock)
            }
        }
    }
}
