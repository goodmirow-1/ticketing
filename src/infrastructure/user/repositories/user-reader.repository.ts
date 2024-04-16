import { Inject, Injectable } from '@nestjs/common'
import type { IUserReaderRepository } from '../../../domain/user/repositories/user-reader.repository.interface'
import { EntityManager } from 'typeorm'
import { User } from '../models/user.entity'
import { NotFoundUserError } from '../../../domain/user/exceptions/not-found-user.exception'
import { InValidPointError } from 'src/domain/user/exceptions/invalid-point.exception'

@Injectable()
export class UserReaderRepositoryTypeORM implements IUserReaderRepository {
    constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {}

    checkValidPoint(point: number) {
        if (point < 0) {
            throw new InValidPointError()
        }
    }

    async findUserById(id: string): Promise<User> {
        const user = await this.entityManager.findOne(User, { where: { id } })

        if (!user) throw new NotFoundUserError(`User id ${id} not found`)

        return user
    }

    async findUserPointById(id: string): Promise<number> {
        return this.entityManager
            .findOne(User, {
                select: ['point'],
                where: { id },
            })
            .then(user => user.point)
    }
}
