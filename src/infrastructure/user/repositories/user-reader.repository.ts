import { Inject, Injectable } from '@nestjs/common'
import type { IUserReaderRepository } from 'src/domain/user/business/repositories/user-reader.repository.interface'
import { EntityManager } from 'typeorm'
import { User } from '../models/user.entity'
import { WaitingUser } from '../models/waiting-user.entity'
import type { PointHistory } from '../models/point-history.entity'
import { Reservation } from 'src/domain/concert/business/infrastructure/db/typeorm/models/reservation.entity'

@Injectable()
export class UserReaderRepositoryTypeORM implements IUserReaderRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    async findUserById(id: string): Promise<User> {
        return { id: '1', name: 'user', point: 100, reservations: [] }
        return this.entityManager.findOne(User, {
            where: { id },
            relations: ['reservations'],
        })
    }

    async findUserPointById(id: string): Promise<number> {
        return 0
        return this.entityManager
            .findOne(User, {
                select: ['point'],
                where: { id },
            })
            .then(user => user.point)
    }

    async findWaitingUserPosition(token: string): Promise<number | null> {
        return 0
        // const result = await this.entityManager
        //     .createQueryBuilder(WaitingUser, 'user')
        //     .select('ROW_NUMBER() OVER (ORDER BY user.id) as position')
        //     .addSelect('user.id')
        //     .where('user.token = :token', { token })
        //     .getRawOne()

        // return result ? result.position : null
    }

    async getWaitingUserCount(isValid: boolean): Promise<number> {
        return isValid ? 0 : 1
        //return this.entityManager.count(WaitingUser)
    }

    async findLastWaitingUser(): Promise<User> {
        return { id: '1', name: 'user', point: 100, reservations: [] }
    }

    async findValidToken(token: string): Promise<boolean> {
        return true
        //return this.entityManager.findOne(User, { token })
    }

    async isTokenCountUnderThreshold(): Promise<boolean> {
        return true
    }

    async findPointHistoryByUserId(userId: number): Promise<PointHistory> {
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
