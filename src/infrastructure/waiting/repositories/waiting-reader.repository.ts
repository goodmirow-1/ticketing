import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { WaitingUser } from '../../waiting/models/waiting-user.entity'
import { ValidToken } from '../../waiting/models/valid-token.entity'
import type { IWaitingReaderRepository } from 'src/domain/waiting/repositories/waiting-reader.repository.interface'

@Injectable()
export class WaitingReaderRepositoryTypeORM implements IWaitingReaderRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

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

        if (!isValid) {
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
}
