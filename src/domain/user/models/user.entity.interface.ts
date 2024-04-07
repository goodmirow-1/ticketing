import type { IReservation } from 'src/domain/concert/models/reservation.entity.interface'

export interface IUser {
    id: string

    name: string

    point: number

    reservations: IReservation[]
}
