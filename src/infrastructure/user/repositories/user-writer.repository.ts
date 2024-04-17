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

    /**
     * Creates a new user with the specified name.
     * @param name The name of the user to be created.
     * @returns The newly created User entity.
     */
    async createUser(name: string): Promise<User> {
        const uuid = uuidv4()

        return this.entityManager.save(User, { id: uuid, name, point: 0, reservations: [] })
    }

    /**
     * Updates the user's point balance and records the transaction in point history.
     * @param user The User entity whose points are to be updated.
     * @param amount The amount to add or subtract from the user's points.
     * @param reservationId Optional reservation ID if the points are associated with a specific reservation.
     * @param queryRunner Optional query runner for transaction management.
     * @returns A new PointHistory entry recording the transaction.
     * @throws InValidPointError if the transaction would result in a negative point balance.
     * @throws FailedUserChargePointError if updating the user's points fails.
     */
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
