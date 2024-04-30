import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { WaitingUser } from '../../waiting/models/waiting-user.entity'
import { ValidToken } from '../../waiting/models/valid-token.entity'
import { generateAccessToken } from '../../../domain/common/jwt-token.util'
import type { IWaitingWriterRepository } from '../../../domain/waiting/repositories/waiting-writer.repository.interface'
import { v4 as uuidv4 } from 'uuid'
import { SchedulerRegistry } from '@nestjs/schedule'
import { SchedulerState } from 'src/domain/common/schedule-state.instance'

@Injectable()
export class WaitingWriterRepositoryTypeORM implements IWaitingWriterRepository {
    private schedulerState = SchedulerState.getInstance()

    constructor(
        @Inject(EntityManager) private readonly entityManager: EntityManager,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    /**
     * Deletes a waiting user from the database.
     * @param id The ID of the waiting user to delete.
     * @returns Boolean indicating whether the delete was successful.
     */
    async deleteWaitingUser(id: string): Promise<boolean> {
        const result = await this.entityManager.delete(WaitingUser, { id })

        return result.affected !== 0
    }

    /**
     * Creates a valid token for the user with a set expiration time.
     * @param userId The user's ID for whom the token is created.
     * @param queryRunner Optional query runner for transaction management.
     * @returns An object containing the token and a waiting number (always 0 for valid tokens).
     */
    async createValidToken(userId: string, querryRunner?: any) {
        const manager = querryRunner ? querryRunner.manager : this.entityManager

        const expirationTime = parseInt(process.env.VALID_TOKEN_EXPIRATION_TIME, 10)
        const expiration = Math.floor(Date.now() / 1000) + expirationTime

        const uuid = uuidv4()
        const token = generateAccessToken(userId, expiration, 0)
        await manager.save(ValidToken, { id: uuid, userId, token, expiration })

        const timeout = setTimeout(async () => {
            await this.entityManager.delete(ValidToken, { token })
        }, expirationTime * 1000)

        this.schedulerRegistry.addTimeout(token, timeout)

        return { token: token, waitingNumber: 0 }
    }

    /**
     * Creates a waiting token for the user, optionally at a specific position.
     * @param userId The user's ID for whom the waiting token is created.
     * @param queryRunner Optional query runner for transaction management.
     * @param lockOption Optional locking configuration for the query.
     * @param position Optional position number in the waiting queue.
     * @returns An object containing the token and the current waiting number.
     */
    async createWaitingToken(userId: string, querryRunner?: any, lockOption?: any, position?: number) {
        const manager = querryRunner ? querryRunner.manager : this.entityManager
        const expiration = Math.floor(Date.now() / 1000) + parseInt(process.env.VALID_TOKEN_EXPIRATION_TIME, 10) + 6000 //대기 토큰은 폴링해야해서 1시간 추가

        if (position) {
            const token = generateAccessToken(userId, expiration, position)
            return { token, waitingNumber: position }
        } else {
            const uuid = uuidv4()
            await manager.save(WaitingUser, { id: uuid, userId })

            const count: number = await manager.count(WaitingUser, { lock: lockOption })

            const token = generateAccessToken(userId, expiration, count)
            this.schedulerState.check = true
            //this.setWaitingScheduler(true)

            return { token, waitingNumber: count }
        }
    }

    /**
     * Decides whether to create a valid token or a waiting token based on the validity state.
     * @param userId The user's ID.
     * @param isValid Boolean indicating whether to create a valid token.
     * @param queryRunner Optional query runner for transaction management.
     * @param lockOption Optional locking configuration for the query.
     * @returns Either a valid token or a waiting token, based on the validity state.
     */
    async createValidTokenOrWaitingUser(userId: string, isValid: boolean, querryRunner?: any, lockOption?: any) {
        if (isValid) {
            return this.createValidToken(userId, querryRunner)
        } else {
            return this.createWaitingToken(userId, querryRunner, lockOption)
        }
    }

    /**
     * Marks a valid token as expired.
     * @param token The token to mark as expired.
     */
    async expiredValidToken(token?: string, querryRunner?: any) {
        const manager = querryRunner ? querryRunner.manager : this.entityManager
        if (token == undefined || token == '') return

        await manager.createQueryBuilder().update(ValidToken).set({ status: false }).where('token = :token', { token }).execute()
    }
}
