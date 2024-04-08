import type { initDataAccesorMock } from 'src/infrastructure/db/data-accesor.interface'
import { initUserReaderMockRepo, initUserWriterMockRepo, setValidToken, setWaitingUserToken } from '../user/business/mocks/user.service.mock'
import { UserService } from '../user/business/service/user.service'
import { extractToken } from '../user/common/jwt-token.util'
import { v4 as uuidv4 } from 'uuid'
import { InValidPointError } from '../user/business/exceptions/invalid-point.exception'

describe('유저 서비스 유닛 테스트', () => {
    let mockReaderRepo: ReturnType<typeof initUserReaderMockRepo>
    let mockWriterRepo: ReturnType<typeof initUserWriterMockRepo>
    let mockDataAccessor: ReturnType<typeof initDataAccesorMock>
    let service: UserService

    beforeEach(() => {
        mockReaderRepo = initUserReaderMockRepo()
        mockWriterRepo = initUserWriterMockRepo()
        service = new UserService(mockReaderRepo, mockWriterRepo, mockDataAccessor)
    })

    describe('유저 토큰 발급 API', () => {
        it('isTokenCountUnderThreshold is true waitnumber is 0', async () => {
            const uuid = uuidv4()

            setValidToken(mockReaderRepo, mockWriterRepo)

            const token = extractToken(await service.generateToken(uuid))

            expect(token.uuid).toBe(uuid)
            expect(token.waitNumber).toBe(0)
        })

        it('isTokenCountUnderThreshold is false waitnumber is 1', async () => {
            const uuid = uuidv4()

            setWaitingUserToken(mockReaderRepo, mockWriterRepo)

            const token = extractToken(await service.generateToken(uuid))

            expect(token.uuid).toBe(uuid)
            expect(token.waitNumber).toBe(1)
        })
    })

    describe('유저 포인트 API', () => {
        it('chargePoint is failed cause point is invalid', async () => {
            mockWriterRepo.checkValidPoint.mockImplementation(() => {
                throw new InValidPointError()
            })

            await expect(service.pointCharge('1', -1)).rejects.toThrow(InValidPointError)
        })

        it('chargePoint is success', async () => {
            const uuid = uuidv4()

            mockReaderRepo.findUserById.mockResolvedValue({ id: uuid, name: 'test', point: 0, reservations: [] })
            mockWriterRepo.calculatePoint.mockResolvedValue({ id: '1', user: { id: uuid }, amount: 1, reason: 'charge' })

            const result = await service.pointCharge(uuid, 1)

            expect(result).toBe(1)
        })
    })
})
