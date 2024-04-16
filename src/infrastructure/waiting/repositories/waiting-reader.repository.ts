import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { WaitingUser } from '../../waiting/models/waiting-user.entity'
import { ValidToken } from '../../waiting/models/valid-token.entity'
import type { IWaitingReaderRepository } from '../../../domain/waiting/repositories/waiting-reader.repository.interface'

@Injectable()
export class WaitingReaderRepositoryTypeORM implements IWaitingReaderRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    isSameWaitingNumber(positionNumber: number, waitingNumber: number): boolean {
        return positionNumber == waitingNumber
    }

    async findWaitingUserPosition(userId: string): Promise<number> {
        const result = await this.entityManager
            .createQueryBuilder(WaitingUser, 'user')
            .select('ROW_NUMBER() OVER (ORDER BY user.created_at) as position')
            .addSelect('user.userId')
            .orderBy('user.created_at', 'ASC')
            .getRawMany()

        // 결과에서 특정 userId의 position 찾기
        const userPosition = result.find(u => u.userId === userId)?.position
        return userPosition ? userPosition : NaN
    }

    async getWaitingUserCount(isValid: boolean): Promise<number> {
        let count = 0

        if (!isValid) {
            count = await this.entityManager.count(WaitingUser)
        }

        return count
    }

    async getTokenStatus(userId: string, token: string) {
        if (token != '') return { token, waitingNumber: 0 }

        return await this.findWaitingUserPosition(userId)
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

    async findValidTokenByUserId(userId: string): Promise<string> {
        const validToken = await this.entityManager.findOne(ValidToken, { where: { userId } })

        return validToken ? validToken.token : ''
    }

    async isValidTokenCountUnderThreshold(queryRunner?: any, lockOption?: any): Promise<boolean> {
        const manager = queryRunner ? queryRunner.manager : this.entityManager

        // status가 true ValidToken만 카운트 -> false = 만료 토큰
        const count = await manager.count(ValidToken, { where: { status: true }, lock: lockOption })

        const maxConnections = parseInt(process.env.MAX_CONNECTIONS, 10)

        return count < maxConnections
    }
}
