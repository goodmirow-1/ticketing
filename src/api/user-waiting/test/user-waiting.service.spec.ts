import { initUserReaderMockRepo } from '../../user/test/user.service.mock'
import { GenerateTokenUseCase } from '../../../application/user-waiting/usecase/generate-token.usecase'
import { initWaitingReaderMockRepo, initWaitingWriterMockRepo } from '../../waiting/test/waiting.service.mock'
import { initDataAccesorMock } from '../../../infrastructure/db/data-accesor.interface'
import { v4 as uuidv4 } from 'uuid'

describe('유닛 콘서트 서비스 유닛 테스트', () => {
    let mockUserReaderRepo: ReturnType<typeof initUserReaderMockRepo>
    let mockWaitingReaderRepo: ReturnType<typeof initWaitingReaderMockRepo>
    let mockWaitingWriterRepo: ReturnType<typeof initWaitingWriterMockRepo>
    let mockDataAccessor: ReturnType<typeof initDataAccesorMock>
    let generateTokenUseCase: GenerateTokenUseCase

    beforeEach(() => {
        mockUserReaderRepo = initUserReaderMockRepo()
        mockWaitingReaderRepo = initWaitingReaderMockRepo()
        mockWaitingWriterRepo = initWaitingWriterMockRepo()
        mockDataAccessor = initDataAccesorMock()

        generateTokenUseCase = new GenerateTokenUseCase(mockUserReaderRepo, mockWaitingReaderRepo, mockWaitingWriterRepo, mockDataAccessor)
    })

    describe('유저 토큰 발급 API', () => {
        it('generateTokenUseCase response is valid token', async () => {
            const uuid = uuidv4()

            mockUserReaderRepo.findUserById.mockResolvedValue({ id: 'id', name: 'name' })
            mockWaitingReaderRepo.isTokenCountUnderThreshold.mockResolvedValue(true)
            mockWaitingWriterRepo.createValidTokenOrWaitingUser.mockResolvedValue('token')

            const result = await generateTokenUseCase.excute(uuid)

            expect(typeof result).toBe('string')
        })

        it('generateTokenUseCase response is waiting', async () => {
            const uuid = uuidv4()

            mockUserReaderRepo.findUserById.mockResolvedValue({ id: 'id', name: 'name' })
            mockWaitingReaderRepo.isTokenCountUnderThreshold.mockResolvedValue(false)
            mockWaitingWriterRepo.createValidTokenOrWaitingUser.mockResolvedValue(1)

            const result = await generateTokenUseCase.excute(uuid)

            expect(typeof result).toBe('number')
        })
    })
})
