import { Inject, Injectable } from '@nestjs/common'
import { IUserReaderRepository, IUserReaderRepositoryToken } from '../../../domain/user/repositories/user-reader.repository.interface'
import { IUserWriterRepository, IUserWriterRepositoryToken } from '../../../domain/user/repositories/user-writer.repository.interface'
import { DataAccessor, DataAccessorToken } from '../../../infrastructure/db/data-accesor.interface'

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

    async excute(userId: string, point: number): Promise<number> {
        this.userReaderRepository.checkValidPoint(point)

        //포인트는 읽는 동안 변할 수 없다.
        const session = await this.dataAccessor.getSession('REPEATABLE READ')

        try {
            const user = await this.userReaderRepository.findUserById(userId, session, {
                mode: 'pessimistic_write',
            })
            const chargePoint = await this.userWriterRepository.calculatePoint(user, point, null, session)

            await this.dataAccessor.commitTransaction(session)
            return chargePoint.amount
        } catch (error) {
            await this.dataAccessor.rollbackTransaction(session)
            throw error
        } finally {
            await this.dataAccessor.releaseQueryRunner(session)
        }
    }
}
