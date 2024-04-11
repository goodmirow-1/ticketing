import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { WaitingUser } from '../../waiting/models/waiting-user.entity'
import { ValidToken } from '../../waiting/models/valid-token.entity'
import { generateAccessToken } from 'src/domain/common/jwt-token.util'
import { SchedulerRegistry } from '@nestjs/schedule'
import type { IWaitingWriterRepository } from 'src/domain/waiting/repositories/waiting-writer.repository.interface'
import type { User } from 'src/infrastructure/user/models/user.entity'
import { SchedulerState } from 'src/domain/common/schedule-state.instance'

@Injectable()
export class WaitingWriterRepositoryTypeORM implements IWaitingWriterRepository {
    private schedulerState = SchedulerState.getInstance()

    constructor(
        @Inject(EntityManager) private readonly entityManager: EntityManager,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    async createWaitingUser(user: User): Promise<WaitingUser> {
        return this.entityManager.save(WaitingUser, { user })
    }

    async deleteWaitingUser(id: string): Promise<boolean> {
        const result = await this.entityManager.delete(WaitingUser, { id })

        return result.affected !== 0
    }

    async createValidToken(userId: string): Promise<string> {
        const expirationTime = parseInt(process.env.VALID_TOKEN_EXPIRATION_TIME, 10)
        const expiration = Math.floor(Date.now() / 1000) + expirationTime

        const token = generateAccessToken(userId, expiration, 0)
        this.entityManager.save(ValidToken, { token, expiration })

        const timeout = setTimeout(async () => {
            await this.entityManager.delete(ValidToken, { token })
        }, expirationTime * 1000)

        this.schedulerRegistry.addTimeout(token, timeout)

        return token
    }

    async createWaitingToken(userId: string, position?: number): Promise<string> {
        const expiration = Math.floor(Date.now() / 1000) + parseInt(process.env.VALID_TOKEN_EXPIRATION_TIME, 10)

        if (position) {
            return generateAccessToken(userId, expiration, position)
        } else {
            this.entityManager.save(WaitingUser, { user: { id: userId } })

            const count = await this.entityManager.count(WaitingUser)

            const token = generateAccessToken(userId, expiration, count + 1)
            this.schedulerState.check = true

            return token
        }
    }

    async createValidTokenOrWaitingUser(userId: string, isValid: boolean): Promise<string> {
        if (isValid) {
            return this.createValidToken(userId)
        } else {
            return this.createWaitingToken(userId)
        }
    }

    async expiredValidToken(token?: string) {
        if (token == undefined || token == '') return

        await this.entityManager.createQueryBuilder().update(ValidToken).set({ status: false }).where('token = :token', { token }).execute()
    }
}
