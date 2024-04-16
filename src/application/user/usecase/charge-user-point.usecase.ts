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
        const user = await this.userReaderRepository.findUserById(userId)
        const chargePoint = await this.userWriterRepository.calculatePoint(user, point, 'charge')

        return chargePoint.amount
    }
}
