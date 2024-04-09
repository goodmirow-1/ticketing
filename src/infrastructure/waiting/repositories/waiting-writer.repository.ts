import { Inject, Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { WaitingUser } from '../../waiting/models/waiting-user.entity'
import { ValidToken } from '../../waiting/models/valid-token.entity'
import { generateAccessToken } from 'src/domain/common/jwt-token.util'
import { SchedulerRegistry } from '@nestjs/schedule'
import type { IWaitingWriterRepository } from 'src/domain/waiting/repositories/waiting-writer.repository.interface'
import type { User } from 'src/infrastructure/user/models/user.entity'

@Injectable()
export class WaitingWriterRepositoryTypeORM implements IWaitingWriterRepository {
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

    async createValidTokenOrWaitingUser(user: User, isValid: boolean): Promise<string | number> {
        if (isValid) {
            const expiration = Math.floor(Date.now() / 1000) + 5 * 60
            const token = generateAccessToken(user.id, expiration)

            this.entityManager.save(ValidToken, { token, expiration })

            const timeout = setTimeout(
                async () => {
                    await this.entityManager.delete(ValidToken, { token })
                },
                (expiration - Math.floor(Date.now() / 1000)) * 1000,
            )

            this.schedulerRegistry.addTimeout(token, timeout)

            return token
        } else {
            this.entityManager.save(WaitingUser, { user })

            const count = await this.entityManager.count(WaitingUser)
            return count + 1
        }
    }

    async deleteValidToken(token: string): Promise<boolean> {
        const result = await this.entityManager.delete(ValidToken, { token })

        return result.affected !== 0
    }
}
