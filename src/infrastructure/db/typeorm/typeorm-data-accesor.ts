import { Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { EntityManager } from 'typeorm'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { DataAccessor } from '../data-accesor.interface'

@Injectable()
export class TypeORMDataAccessor implements DataAccessor {
    constructor(@InjectEntityManager() private entityManager: EntityManager) {}

    async getSession(option?: any): Promise<QueryRunner> {
        const queryRunner = this.entityManager.connection.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction(option)
        return queryRunner
    }

    async commitTransaction(session: QueryRunner): Promise<void> {
        await session.commitTransaction()
    }

    async rollbackTransaction(session: QueryRunner): Promise<void> {
        await session.rollbackTransaction()
    }

    async releaseQueryRunner(session: QueryRunner): Promise<void> {
        await session.release()
    }
}
