import { Inject, Injectable } from '@nestjs/common'
import { IUserReaderRepository, IUserReaderRepositoryToken } from '../../../domain/user/repositories/user-reader.repository.interface'
import { IWaitingReaderRepository, IWaitingReaderRepositoryToken } from '../../../domain/waiting/repositories/waiting-reader.repository.interface'
import { IWaitingWriterRepository, IWaitingWriterRepositoryToken } from '../../../domain/waiting/repositories/waiting-writer.repository.interface'
import { DataAccessor, DataAccessorToken } from '../../../infrastructure/db/data-accesor.interface'
import type { GenerateTokenRequestType } from '../dtos/generate-token.dto'
import { GenerateTokenResponseDto } from '../dtos/generate-token.dto'
import type { IRequestDTO } from 'src/application/common/request.interface'

@Injectable()
export class GenerateTokenUseCase {
    constructor(
        @Inject(IUserReaderRepositoryToken)
        private readonly userReaderRepository: IUserReaderRepository,
        @Inject(IWaitingReaderRepositoryToken)
        private readonly waitingReaderRepository: IWaitingReaderRepository,
        @Inject(IWaitingWriterRepositoryToken)
        private readonly waitingWriterRepository: IWaitingWriterRepository,
        @Inject(DataAccessorToken)
        private readonly dataAccessor: DataAccessor,
    ) {}

    async execute(requestDto: IRequestDTO<GenerateTokenRequestType>): Promise<GenerateTokenResponseDto> {
        requestDto.validate()

        const { userId } = requestDto.toUseCaseInput()

        await this.userReaderRepository.findUserById(userId)

        //대기열이 활성화되어 있으면
        if (await this.waitingReaderRepository.checkWaitingScheduler()) {
            //대기열 토큰을 발행
            return await this.waitingWriterRepository.createWaitingToken(userId)
        } else {
            const session = await this.dataAccessor.getSession('READ COMMITTED')

            try {
                //유효토큰 발급이 가능한 상태인지 조회
                const isValidToken = await this.waitingReaderRepository.isValidTokenCountUnderThreshold(session, { mode: 'pessimistic_write' })

                //발급 가능한 상태에 따라 유효토큰or대기 토큰 발행
                const { token, waitingNumber } = await this.waitingWriterRepository.createValidTokenOrWaitingUser(userId, isValidToken, session, {
                    mode: 'pessimistic_write',
                })

                await this.dataAccessor.commitTransaction(session)
                return new GenerateTokenResponseDto(token, waitingNumber)
            } catch (error) {
                await this.dataAccessor.rollbackTransaction(session)
                throw error
            } finally {
                await this.dataAccessor.releaseQueryRunner(session)
            }
        }
    }
}
