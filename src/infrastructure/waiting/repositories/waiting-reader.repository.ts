import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { WaitingUser } from '../../waiting/models/waiting-user.entity'
import { ValidToken } from '../../waiting/models/valid-token.entity'
import type { IWaitingReaderRepository } from '../../../domain/waiting/repositories/waiting-reader.repository.interface'
import { WaitingScheduler } from '../models/waiting-scheduler.entity'

@Injectable()
export class WaitingReaderRepositoryTypeORM implements IWaitingReaderRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    async onModuleInit(): Promise<void> {
        const existingScheduler = await this.entityManager.findOne(WaitingScheduler, { where: { id: 1 } })
        if (!existingScheduler) {
            const newScheduler = this.entityManager.create(WaitingScheduler, {
                id: 1, // Set the ID and other default values as needed
                check: false, // Example property, set the initial value as needed
            })
            await this.entityManager.save(newScheduler)
        }
    }

    /**
     * Finds the queue position of a waiting user based on the creation date.
     * @param userId The ID of the user whose position in the waiting list is to be determined.
     * @returns The position of the user in the waiting queue or NaN if not found.
     */
    async findWaitingUserPosition(userId: string): Promise<number> {
        const result = await this.entityManager
            .createQueryBuilder(WaitingUser, 'user')
            .select('ROW_NUMBER() OVER (ORDER BY user.created_at) as position')
            .addSelect('userId')
            .orderBy('user.created_at', 'ASC')
            .getRawMany()

        // 결과에서 특정 userId의 position 찾기
        const userPosition = result.find(u => u.userId === userId)?.position
        return userPosition ? userPosition : NaN
    }

    /**
     * Retrieves the status of a token for a user.
     * @param userId The user's ID.
     * @param token The token to check the status of.
     * @returns The token status with waiting number.
     */
    async getTokenStatus(userId: string, token: string) {
        if (token != undefined) return { token, waitingNumber: 0 }

        const position = await this.findWaitingUserPosition(userId)

        return { token: null, waitingNumber: position }
    }

    /**
     * Finds the last waiting user based on their position in the queue.
     * @returns An array containing the last user in the waiting list.
     */
    async findLastWaitingUser(): Promise<WaitingUser[]> {
        return this.entityManager.find(WaitingUser, {
            order: {
                id: 'ASC',
            },
            take: 1,
        })
    }

    /**
     * Finds a valid token associated with a user ID.
     * @param userId The user's ID for whom to find the valid token.
     * @returns The valid token if found, otherwise an empty string.
     */
    async findValidTokenByUserId(userId: string): Promise<string> {
        const validToken = await this.entityManager.findOne(ValidToken, { where: { userId } })

        return validToken ? validToken.token : undefined
    }

    /**
     * Determines if the count of valid tokens is below a defined threshold.
     * @param queryRunner Optional query runner for transaction management.
     * @param lockOption Optional locking configuration for the query.
     * @returns True if the count of valid tokens is below the threshold, otherwise false.
     */
    async isValidTokenCountUnderThreshold(queryRunner?: any, lockOption?: any): Promise<boolean> {
        const manager = queryRunner ? queryRunner.manager : this.entityManager

        // status가 true ValidToken만 카운트 -> false = 만료 토큰
        const count = await manager.count(ValidToken, { where: { status: true }, lock: lockOption })

        const maxConnections = parseInt(process.env.MAX_CONNECTIONS, 10)

        return count < maxConnections
    }

    async checkWaitingScheduler(): Promise<boolean> {
        return (await this.entityManager.findOne(WaitingScheduler, { where: { id: 1 } })).check
    }
}
