import type { IUser } from './user.entity.interface'

export class IPointHistory {
    id: string

    user: IUser

    reservationId: string

    amount: number

    reason: 'charge' | 'payment'

    created_at: Date
}
