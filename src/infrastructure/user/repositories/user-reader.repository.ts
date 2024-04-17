import { Inject, Injectable } from '@nestjs/common'
import type { IUserReaderRepository } from '../../../domain/user/repositories/user-reader.repository.interface'
import { EntityManager } from 'typeorm'
import { User } from '../models/user.entity'
import { NotFoundUserError } from '../../../domain/user/exceptions/not-found-user.exception'
import { InValidPointError } from 'src/domain/user/exceptions/invalid-point.exception'

@Injectable()
export class UserReaderRepositoryTypeORM implements IUserReaderRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    /**
     * Validates that a user's point value is non-negative.
     * @param point The point value to check.
     * @throws InValidPointError If the point value is less than 0.
     */
    checkValidPoint(point: number) {
        if (point < 0) {
            throw new InValidPointError()
        }
    }

    /**
     * Finds a user by their ID.
     * @param id The ID of the user to find.
     * @param queryRunner Optional query runner for transaction management.
     * @param lockOption Optional locking configuration for the query.
     * @returns The found user entity.
     * @throws NotFoundUserError If no user is found with the given ID.
     */
    async findUserById(id: string, querryRunner?: any, lockOption?: any): Promise<User> {
        const manager = querryRunner ? querryRunner.manager : this.entityManager

        const user = await manager.findOne(User, { where: { id }, lock: lockOption })

        if (!user) throw new NotFoundUserError(`User id ${id} not found`)

        return user
    }

    /**
     * Retrieves the point value of a user by their ID.
     * @param id The ID of the user whose point value is to be retrieved.
     * @returns The point value of the user.
     * @throws NotFoundUserError If no user is found with the given ID.
     */
    async findUserPointById(id: string): Promise<number> {
        return this.entityManager
            .findOne(User, {
                select: ['point'],
                where: { id },
            })
            .then(user => user.point)
    }
}
