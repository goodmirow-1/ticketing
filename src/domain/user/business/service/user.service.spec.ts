import type { initDataAccesorMock } from 'src/infrastructure/db/data-accesor.interface'
import { initUserReaderMockRepo, initUserWriterMockRepo, setValidToken, setWaitingUserToken } from '../mocks/user.service.mock'
import { UserService } from './user.service'
import { extractToken } from '../../common/jwt-token.util'
import { v4 as uuidv4 } from 'uuid'

describe('유저 서비스 유닛 테스트', () => {
    let mockReaderRepo: ReturnType<typeof initUserReaderMockRepo>
    let mockWriterRepo: ReturnType<typeof initUserWriterMockRepo>
    let mockDataAccessor: ReturnType<typeof initDataAccesorMock>
    let userService: UserService

    beforeEach(() => {
        mockReaderRepo = initUserReaderMockRepo()
        mockWriterRepo = initUserWriterMockRepo()
        userService = new UserService(mockReaderRepo, mockWriterRepo, mockDataAccessor)
    })

    describe('유저 토큰 발급 API', () => {
        it('isTokenCountUnderThreshold가 true일 때 대기순번 0', async () => {
            const uuid = uuidv4()

            setValidToken(mockReaderRepo, mockWriterRepo)

            const token = extractToken(await userService.generateToken(uuid))

            expect(token.uuid).toBe(uuid)
            expect(token.waitNumber).toBe(0)
        })

        it('isTokenCountUnderThreshold가 false 때 대기순번 1', async () => {
            const uuid = uuidv4()

            setWaitingUserToken(mockReaderRepo, mockWriterRepo)

            const token = extractToken(await userService.generateToken(uuid))

            expect(token.uuid).toBe(uuid)
            expect(token.waitNumber).toBe(1)
        })
    })
})
