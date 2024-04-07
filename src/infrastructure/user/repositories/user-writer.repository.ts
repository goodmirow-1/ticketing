import { Inject, Injectable } from '@nestjs/common'
import type { IUserWriterRepository } from 'src/domain/user/business/repositories/user-writer.repository.interface'
import { EntityManager } from 'typeorm'
import { User } from '../models/user.entity'
import type { WaitingUser } from '../models/waiting-user.entity'
import type { Reservation } from 'src/domain/concert/business/infrastructure/db/typeorm/models/reservation.entity'
import type { PointHistory } from '../models/point-history.entity'

@Injectable()
export class UserWriterRepositoryTypeORM implements IUserWriterRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    async createUser(name: string): Promise<User> {
        return { id: '1', name: 'user', point: 100, reservations: [] }
        return this.entityManager.save(User, { name, point: 0, reservations: [] })
    }

    async updateUserPoint(id: string, point: number): Promise<User> {
        return { id: '1', name: 'user', point: 200, reservations: [] }
    }

    async createWaitingUser(token: string): Promise<WaitingUser> {
        return { id: 1, token: 'token' }
    }

    async deleteWaitingUser(id: string): Promise<boolean> {
        return true
    }

    async createValidTokenOrWaitingUser(isValid: boolean, token: string): Promise<string> {
        return token
    }

    async deleteValidToken(token: string): Promise<boolean> {
        return true
    }

    async createPointHistory(userId: string, point: number): Promise<PointHistory> {
        return {
            id: 1,
            amount: 100,
            reason: 'payment',
            user: { id: '1', name: 'user', point: 100, reservations: [] },
            reservation: {} as Reservation,
            paymentDate: new Date(),
        }
    }
}
