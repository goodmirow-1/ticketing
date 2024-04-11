import type { IUser } from 'src/domain/user/models/user.entity.interface'
import type { IWaitingUser } from '../../waiting/models/waiting-user.entity.interface'

export interface IWaitingWriterRepository {
    createWaitingUser(user: IUser): Promise<IWaitingUser>
    deleteWaitingUser(id: string): Promise<boolean>

    createValidToken(userId: string, position?: number): Promise<string>
    createWaitingToken(userId: string): Promise<string>
    createValidTokenOrWaitingUser(userId: string, isValid: boolean): Promise<string>

    expiredValidToken(token?: string)
}
