import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { WaitingUser } from '../../waiting/models/waiting-user.entity'
import { ValidToken } from '../../waiting/models/valid-token.entity'
import type { IWaitingReaderRepository } from 'src/domain/waiting/repositories/waiting-reader.repository.interface'

@Injectable()
export class WaitingReaderRepositoryTypeORM implements IWaitingReaderRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    isSameWaitingNumber(positionNumber: number, waitingNumber: number): boolean {
        return positionNumber === waitingNumber
    }

    async findWaitingUserPosition(userId: string): Promise<number> {
        const result = await this.entityManager
            .createQueryBuilder(WaitingUser, 'user')
            .select('ROW_NUMBER() OVER (ORDER BY user.id) as position')
            .addSelect('user.userId')
            .where('user.userId = :userId', { userId })
            .getRawOne()

        return result ? result.position : NaN
    }

    async getWaitingUserCount(isValid: boolean): Promise<number> {
        let count = 0

        if (!isValid) {
            count = await this.entityManager.count(WaitingUser)
        }

        return count
    }

    async findLastWaitingUser(): Promise<WaitingUser[]> {
        return this.entityManager.find(WaitingUser, {
            order: {
                id: 'ASC',
            },
            relations: ['user'],
            take: 1,
        })
    }

    async findValidToken(token: string): Promise<boolean> {
        const validToken = await this.entityManager.findOne(ValidToken, { where: { token } })

        return !!validToken
    }

    async isTokenCountUnderThreshold(): Promise<boolean> {
        // status가 true ValidToken만 카운트 -> false = 만료 토큰
        const count = await this.entityManager.count(ValidToken, { where: { status: true } })

        const maxConnections = parseInt(process.env.MAX_CONNECTIONS, 10)

        return count < maxConnections
    }
}
