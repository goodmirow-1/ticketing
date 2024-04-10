import { Inject, Injectable } from '@nestjs/common'
import { IUserReaderRepository } from 'src/domain/user/repositories/user-reader.repository.interface'
import { IUserWriterRepository } from 'src/domain/user/repositories/user-writer.repository.interface'
import { DataAccessor } from 'src/infrastructure/db/data-accesor.interface'

@Injectable()
export class ChargeUserPointUseCase {
    constructor(
        @Inject('IUserReaderRepository')
        private readonly userReaderRepository: IUserReaderRepository,
        @Inject('IUserWriterRepository')
        private readonly userWriterRepository: IUserWriterRepository,
        @Inject('DataAccessor')
        private readonly dataAccessor: DataAccessor,
    ) {}

    async excute(userId: string, point: number): Promise<number> {
        this.userWriterRepository.checkValidPoint(point)
        const user = await this.userReaderRepository.findUserById(userId)
        const chargePoint = await this.userWriterRepository.calculatePoint(user, point, 'charge')

        return chargePoint.amount
    }
}