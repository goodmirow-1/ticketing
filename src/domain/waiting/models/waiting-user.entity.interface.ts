import type { IUser } from '../../user/models/user.entity.interface'

export interface IWaitingUser {
    id: string

    user: IUser
}
