import { Inject, Injectable } from '@nestjs/common'
import type { IUserReaderRepository } from 'src/domain/user/business/repositories/user-reader.repository.interface'
import { EntityManager } from 'typeorm'
import { User } from '../models/user.entity'
import { WaitingUser } from '../models/waiting-user.entity'
import { PointHistory } from '../models/point-history.entity'
import { NotFoundUserError } from 'src/domain/user/business/exceptions/not-found-user.exception'
import { ValidToken } from '../models/valid-token.entity'

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

    async findWaitingUserById(id: string): Promise<WaitingUser> {
        return this.entityManager.findOne(WaitingUser, { where: { id } })
    }

    async findWaitingUserPosition(token: string): Promise<number | null> {
        const result = await this.entityManager
            .createQueryBuilder(WaitingUser, 'user')
            .select('ROW_NUMBER() OVER (ORDER BY user.id) as position')
            .addSelect('user.id')
            .where('user.token = :token', { token })
            .getRawOne()

        return result ? result.position : null
    }

    async getWaitingUserCount(isValid: boolean): Promise<number> {
        let count = 0

        if (isValid) {
            count = await this.entityManager.count(ValidToken)
        } else {
            count = await this.entityManager.count(WaitingUser)
        }

        return count
    }

    async findLastWaitingUser(): Promise<WaitingUser> {
        return this.entityManager.findOne(WaitingUser, { order: { id: 'DESC' } })
    }

    async findValidToken(token: string): Promise<boolean> {
        const validToken = await this.entityManager.findOne(ValidToken, { where: { token } })

        return !!validToken
    }

    async isTokenCountUnderThreshold(): Promise<boolean> {
        const count = await this.entityManager.count(ValidToken)

        return count < 100
    }

    async findPointHistoryByUserId(userId: string): Promise<PointHistory> {
        const user = await this.entityManager.findOne(User, { where: { id: userId } })

        if (!user) throw new NotFoundUserError(`User id ${userId} not found`)

        return this.entityManager.findOne(PointHistory, { where: { user } })
    }
}
