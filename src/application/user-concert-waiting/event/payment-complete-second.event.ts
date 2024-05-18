import type { IPointHistory } from 'src/domain/user/models/point-history.entity.interface'
import { v4 as uuidv4 } from 'uuid'

export class PaymentCompleteSecondEvent {
    public readonly eventId: string
    public readonly publishing: number
    public readonly pointHistory: IPointHistory

    constructor(pointHistory: IPointHistory) {
        this.eventId = uuidv4()
        this.publishing = new Date().getTime()
        this.pointHistory = pointHistory
    }
}
