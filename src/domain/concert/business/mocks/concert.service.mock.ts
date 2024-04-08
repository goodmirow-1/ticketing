import type { IConcertReaderRepository } from '../repositories/concert-reader.repository.interface'
import type { IConcertWriterRepository } from '../repositories/concert-writer.repository.interface'

export function initConcertReaderMockRepo(): Record<keyof IConcertReaderRepository, jest.Mock> {
    return {
        findConcertById: jest.fn(),
        findConcertDateById: jest.fn(),
        findAllConcertsByDate: jest.fn(),
        findSeatById: jest.fn(),
        findSeatsByConcertDate: jest.fn(),
        findReservationById: jest.fn(),
    }
}

export function initConcertWriterMockRepo(): Record<keyof IConcertWriterRepository, jest.Mock> {
    return {
        createReservation: jest.fn(),
        createConcert: jest.fn(),
        createConcertDate: jest.fn(),
        createSeat: jest.fn(),
    }
}
