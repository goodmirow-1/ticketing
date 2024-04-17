import type { IUser } from '../models/user.entity.interface'

export const IUserReaderRepositoryToken = Symbol.for('IUserReaderRepository')

export interface IUserReaderRepository {
    findUserById(id: string, querryRunner?: any, lockOption?: any): Promise<IUser>
    findUserPointById(id: string): Promise<number>

    checkValidPoint(point: number): void
}
