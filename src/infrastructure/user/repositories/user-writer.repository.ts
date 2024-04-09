import { Inject, Injectable } from '@nestjs/common'
import type { IUserWriterRepository } from 'src/domain/user/repositories/user-writer.repository.interface'
import { EntityManager } from 'typeorm'
import { User } from '../models/user.entity'
import { WaitingUser } from '../models/waiting-user.entity'
import { Reservation } from 'src/infrastructure/concert/models/reservation.entity'
import { PointHistory } from '../models/point-history.entity'
import { FailedUserChargePointError } from 'src/domain/user/exceptions/failed-user-charge-point.exception'
import { InValidPointError } from 'src/domain/user/exceptions/invalid-point.exception'
import { FailedCreatePointHistoryError } from 'src/domain/user/exceptions/failed-create-point-history.exception'
import { NotFoundReservationError } from 'src/domain/user/exceptions/not-found-reservation.exception'
import { ValidToken } from '../models/valid-token.entity'

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

    async calculatePoint(user: User, point: number, reason: 'charge' | 'payment'): Promise<PointHistory> {
        if (reason == 'payment' && user.point < point) {
            throw new InValidPointError('Not enough point')
        }

        const result = await this.entityManager
            .createQueryBuilder()
            .update(User)
            .set({ point: user.point + point })
            .where('id', { id: user.id })
            .execute()

        if (result.affected === 0) throw new FailedUserChargePointError('Failed to charge point')

        const pointHistory = await this.entityManager.save(PointHistory, { user, amount: point, reason })

        if (!pointHistory) {
            //roll back
            await this.entityManager.createQueryBuilder().update(User).set({ point: user.point }).where('id', { id: user.id }).execute()

            throw new FailedCreatePointHistoryError('Failed to create point history')
        }

        return pointHistory
    }

    async createWaitingUser(token: string): Promise<WaitingUser> {
        return this.entityManager.save(WaitingUser, { token })
    }

    async deleteWaitingUser(id: string): Promise<boolean> {
        const result = await this.entityManager.delete(WaitingUser, { id })

        return result.affected !== 0
    }

    async createValidTokenOrWaitingUser(isValid: boolean, token: string): Promise<string> {
        if (isValid) {
            this.entityManager.save(ValidToken, { token })
        } else {
            this.entityManager.save(WaitingUser, { token })
        }

        return token
    }

    async deleteValidToken(token: string): Promise<boolean> {
        const result = await this.entityManager.delete(ValidToken, { token })

        return result.affected !== 0
    }

    async payment(reservationId: string): Promise<PointHistory> {
        const reservation = await this.entityManager.findOne(Reservation, { where: { id: reservationId } })

        if (!reservation) throw new NotFoundReservationError(`Reservation id ${reservationId} not found`)

        const point = reservation.user.point - reservation.amount

        if (point < 0) throw new InValidPointError('Not enough point')

        return await this.calculatePoint(reservation.user, -reservation.amount, 'payment')
    }
}
