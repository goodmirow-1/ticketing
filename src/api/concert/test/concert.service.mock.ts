import type { IConcertReaderRepository } from '../../../domain/concert/repositories/concert-reader.repository.interface'
import type { IConcertWriterRepository } from '../../../domain/concert/repositories/concert-writer.repository.interface'

export function initConcertReaderMockRepo(): Record<keyof IConcertReaderRepository, jest.Mock> {
    return {
        findConcertById: jest.fn(),
        findConcertDateById: jest.fn(),
        findAllConcerts: jest.fn(),
        checkValidConcertDateByDate: jest.fn(),
        checkValidSeatNumber: jest.fn(),
        findSeatById: jest.fn(),
        findSeatsByConcertDateId: jest.fn(),
        findReservationById: jest.fn(),
        checkValidReservation: jest.fn(),
    }
}

export function initConcertWriterMockRepo(): Record<keyof IConcertWriterRepository, jest.Mock> {
    return {
        createReservation: jest.fn(),
        createConcert: jest.fn(),
        createConcertDate: jest.fn(),
        createSeat: jest.fn(),
        updateConcertDateAvailableSeat: jest.fn(),
        doneReservationPaid: jest.fn(),
    }
}
