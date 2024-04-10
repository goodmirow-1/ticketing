import type { IUser } from 'src/domain/user/models/user.entity.interface'
import type { IWaitingUser } from '../../waiting/models/waiting-user.entity.interface'

export interface IWaitingWriterRepository {
    createWaitingUser(user: IUser): Promise<IWaitingUser>
    deleteWaitingUser(id: string): Promise<boolean>

    createValidTokenOrWaitingUser(user: IUser, isValid: boolean): Promise<string | number>
    deleteValidToken(token: string): Promise<boolean>
}