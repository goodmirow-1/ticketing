import { Inject, Injectable } from '@nestjs/common'
import type { IUserReaderRepository } from 'src/domain/user/repositories/user-reader.repository.interface'
import { EntityManager } from 'typeorm'
import { User } from '../models/user.entity'
import { PointHistory } from '../models/point-history.entity'
import { NotFoundUserError } from 'src/domain/user/exceptions/not-found-user.exception'

@Injectable()
export class UserReaderRepositoryTypeORM implements IUserReaderRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    async findUserById(id: string): Promise<User> {
        const user = await this.entityManager.findOne(User, { where: { id } })

        if (!user) throw new NotFoundUserError(`User id ${id} not found`)

        return user
    }

    async findUserPointById(id: string): Promise<number> {
        return this.entityManager
            .findOne(User, {
                select: ['point'],
                where: { id },
            })
            .then(user => user.point)
    }

    async findPointHistoryByUserId(userId: string): Promise<PointHistory> {
        const user = await this.entityManager.findOne(User, { where: { id: userId } })

        if (!user) throw new NotFoundUserError(`User id ${userId} not found`)

        return this.entityManager.findOne(PointHistory, { where: { user } })
    }
}
