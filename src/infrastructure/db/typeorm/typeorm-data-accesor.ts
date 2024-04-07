import { Injectable } from '@nestjs/common'
import type { QueryRunner } from 'typeorm'
import { EntityManager } from 'typeorm'
import { InjectEntityManager } from '@nestjs/typeorm'
import type { DataAccessor } from '../data-accesor.interface'
import type { IsolationLevel } from 'typeorm/driver/types/IsolationLevel'

@Injectable()
export class TypeORMDataAccessor implements DataAccessor {
    constructor(@InjectEntityManager() private entityManager: EntityManager) {}

    async getSession(option?: IsolationLevel): Promise<QueryRunner> {
        const queryRunner = this.entityManager.connection.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction(option)
        return queryRunner
    }

    async commitTransaction(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.commitTransaction()
    }

    async rollbackTransaction(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.rollbackTransaction()
    }

    async releaseQueryRunner(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.release()
    }
}

export type LockOption =
    | {
          mode: 'optimistic'
          version: number | Date
      }
    | {
          mode:
              | 'pessimistic_read'
              | 'pessimistic_write'
              | 'dirty_read'
              | 'pessimistic_partial_write'
              | 'pessimistic_write_or_fail'
              | 'for_no_key_update'
              | 'for_key_share'
          tables?: string[]
          onLocked?: 'nowait' | 'skip_locked'
      }
