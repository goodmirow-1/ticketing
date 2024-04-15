import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { WaitingUser } from '../../waiting/models/waiting-user.entity'
import { ValidToken } from '../../waiting/models/valid-token.entity'
import { generateAccessToken } from '../../../domain/common/jwt-token.util'
import { SchedulerRegistry } from '@nestjs/schedule'
import type { IWaitingWriterRepository } from '../../../domain/waiting/repositories/waiting-writer.repository.interface'
import { SchedulerState } from '../../../domain/common/schedule-state.instance'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class WaitingWriterRepositoryTypeORM implements IWaitingWriterRepository {
    private schedulerState = SchedulerState.getInstance()

    constructor(
        @Inject(EntityManager) private readonly entityManager: EntityManager,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    async deleteWaitingUser(id: string): Promise<boolean> {
        const result = await this.entityManager.delete(WaitingUser, { id })

        return result.affected !== 0
    }

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

    async createWaitingToken(userId: string, querryRunner?: any, lockOption?: any, position?: number) {
        const manager = querryRunner ? querryRunner.manager : this.entityManager
        const expiration = Math.floor(Date.now() / 1000) + parseInt(process.env.VALID_TOKEN_EXPIRATION_TIME, 10) + 6000 //대기 토큰은 폴링해야해서 1시간 추가

        if (position) {
            console.log(position)
            const token = generateAccessToken(userId, expiration, position)
            return { token, waitingNumber: position }
        } else {
            const uuid = uuidv4()
            await manager.save(WaitingUser, { id: uuid, user: { id: userId } })

            const count: number = await manager.count(WaitingUser, { lock: lockOption })

            const token = generateAccessToken(userId, expiration, count)
            this.schedulerState.check = true

            return { token, waitingNumber: count }
        }
    }

    async createValidTokenOrWaitingUser(userId: string, isValid: boolean, querryRunner?: any, lockOption?: any) {
        if (isValid) {
            return this.createValidToken(userId, querryRunner)
        } else {
            return this.createWaitingToken(userId, querryRunner, lockOption)
        }
    }

    async expiredValidToken(token?: string) {
        if (token == undefined || token == '') return

        await this.entityManager.createQueryBuilder().update(ValidToken).set({ status: false }).where('token = :token', { token }).execute()
    }
}
