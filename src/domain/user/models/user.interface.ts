import type { IReservation } from 'src/domain/concert/models/reservation.interface'

export interface IUser {
    id: string

    name: string

    point: number

    reservations: IReservation[]
}
