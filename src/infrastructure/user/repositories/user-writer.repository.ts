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

    checkValidPoint(point: number) {
        if (point < 0) {
            throw new InValidPointError()
        }
    }

    async createUser(name: string): Promise<User> {
        const uuid = uuidv4()

        return this.entityManager.save(User, { id: uuid, name, point: 0, reservations: [] })
    }

    async calculatePoint(user: User, amount: number, reason: 'charge' | 'payment', reservationId?: string): Promise<PointHistory> {
        if (reason == 'payment' && user.point < Math.abs(amount)) {
            throw new InValidPointError('Not enough point')
        }

        const point = user.point + amount

        const result = await this.entityManager.createQueryBuilder().update(User).set({ point }).where('id = :id', { id: user.id }).execute()

        if (result.affected === 0) throw new FailedUserChargePointError('Failed to charge point')

        const uuid = uuidv4()
        return await this.entityManager.save(PointHistory, {
            id: uuid,
            user,
            amount: amount,
            reason,
            reservation: reason == 'payment' ? { id: reservationId } : null,
        })
    }
}
