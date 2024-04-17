import { Inject, Injectable } from '@nestjs/common'
import type { IUserWriterRepository } from '../../../domain/user/repositories/user-writer.repository.interface'
import { EntityManager } from 'typeorm'
import { User } from '../models/user.entity'
import { PointHistory } from '../models/point-history.entity'
import { FailedUserChargePointError } from '../../../domain/user/exceptions/failed-user-charge-point.exception'
import { InValidPointError } from '../../../domain/user/exceptions/invalid-point.exception'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class UserWriterRepositoryTypeORM implements IUserWriterRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    async createUser(name: string): Promise<User> {
        const uuid = uuidv4()

        return this.entityManager.save(User, { id: uuid, name, point: 0, reservations: [] })
    }

    async calculatePoint(user: User, amount: number, reservationId?: string, querryRunner?: any): Promise<PointHistory> {
        const reason = reservationId ? 'payment' : 'charge'
        const manager = querryRunner ? querryRunner.manager : this.entityManager

        if (reason == 'payment' && user.point < Math.abs(amount)) {
            throw new InValidPointError('Not enough point')
        }

        const point = user.point + amount

        const result = await manager.createQueryBuilder().update(User).set({ point }).where('id = :id', { id: user.id }).execute()

        if (result.affected === 0) throw new FailedUserChargePointError('Failed to charge point')

        const uuid = uuidv4()
        return await manager.save(PointHistory, {
            id: uuid,
            user,
            amount: amount,
            reason,
            reservationId: reason == 'payment' ? reservationId : null,
        })
    }
}
