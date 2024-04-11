import { Inject, Injectable } from '@nestjs/common'
import type { IUserWriterRepository } from 'src/domain/user/repositories/user-writer.repository.interface'
import { EntityManager } from 'typeorm'
import { User } from '../models/user.entity'
import { PointHistory } from '../models/point-history.entity'
import { FailedUserChargePointError } from 'src/domain/user/exceptions/failed-user-charge-point.exception'
import { InValidPointError } from 'src/domain/user/exceptions/invalid-point.exception'
import { FailedCreatePointHistoryError } from 'src/domain/user/exceptions/failed-create-point-history.exception'
import type { Reservation } from '../../concert/models/reservation.entity'

@Injectable()
export class UserWriterRepositoryTypeORM implements IUserWriterRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    checkValidPoint(point: number) {
        if (point < 0) {
            throw new InValidPointError()
        }
    }

    async createUser(name: string): Promise<User> {
        return this.entityManager.save(User, { name, point: 0, reservations: [] })
    }

    async calculatePoint(user: User, amount: number, reason: 'charge' | 'payment', reservation?: Reservation): Promise<PointHistory> {
        if (reason == 'payment' && user.point < Math.abs(amount)) {
            throw new InValidPointError('Not enough point')
        }

        const point = user.point + amount

        const result = await this.entityManager.createQueryBuilder().update(User).set({ point }).where('id = :id', { id: user.id }).execute()

        if (result.affected === 0) throw new FailedUserChargePointError('Failed to charge point')

        const pointHistory = await this.entityManager.save(PointHistory, {
            user,
            amount: amount,
            reason,
            reservation: reservation,
        })

        if (!pointHistory) {
            //roll back
            await this.entityManager.createQueryBuilder().update(User).set({ point: user.point }).where('id = :id', { id: user.id }).execute()

            throw new FailedCreatePointHistoryError('Failed to create point history')
        }

        return pointHistory
    }
}
