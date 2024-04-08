import type { IPointHistory } from '../../models/point-history.entity.interface'
import type { IUser } from '../../models/user.entity.interface'
import type { IWaitingUser } from '../../models/waiting-user.entity.interface'

export interface IUserWriterRepository {
    createUser(name: string): Promise<IUser>
    calculatePoint(user: IUser, point: number, reason: string): Promise<IPointHistory>
    checkValidPoint(point: number): void

    createWaitingUser(token: string): Promise<IWaitingUser>
    deleteWaitingUser(id: string): Promise<boolean>

    createValidTokenOrWaitingUser(isValid: boolean, token: string): Promise<string>
    deleteValidToken(token: string): Promise<boolean>
}
