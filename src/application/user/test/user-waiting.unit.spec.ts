import { initUserReaderMockRepo } from '../../../domain/user/test/user.mock'
import { GenerateTokenUseCase } from '../usecase/generate-token.usecase'
import { initWaitingReaderRedisMockRepo, initWaitingWriterRedisMockRepo } from '../../../domain/user/test/waiting.mock'
import { v4 as uuidv4 } from 'uuid'
import { GenerateTokenRequestDto } from 'src/application/user/dtos/generate-token.dto'

describe('유닛 콘서트 서비스 유닛 테스트', () => {
    let mockUserReaderRepo: ReturnType<typeof initUserReaderMockRepo>
    let mockWaitingReaderRedisRepo: ReturnType<typeof initWaitingReaderRedisMockRepo>
    let mockWaitingWriterRedisRepo: ReturnType<typeof initWaitingWriterRedisMockRepo>
    let generateTokenUseCase: GenerateTokenUseCase

    beforeEach(() => {
        mockUserReaderRepo = initUserReaderMockRepo()
        mockWaitingReaderRedisRepo = initWaitingReaderRedisMockRepo()
        mockWaitingWriterRedisRepo = initWaitingWriterRedisMockRepo()

        generateTokenUseCase = new GenerateTokenUseCase(mockUserReaderRepo, mockWaitingReaderRedisRepo, mockWaitingWriterRedisRepo)
    })

    describe('유저 토큰 발급 API', () => {
        it('generateTokenUseCase response is valid token', async () => {
            const uuid = uuidv4()

            mockUserReaderRepo.findUserById.mockResolvedValue({ id: uuid, name: 'name' })
            mockWaitingReaderRedisRepo.getValidTokenByUserId.mockResolvedValue('token')
            mockWaitingReaderRedisRepo.getWaitingNumber.mockResolvedValue(0)
            mockWaitingReaderRedisRepo.isValidTokenCountUnderThreshold.mockResolvedValue(true)
            mockWaitingReaderRedisRepo.isWaitingQueueEmpty.mockResolvedValue(true)
            mockWaitingWriterRedisRepo.createValidTokenOrWaitingUser.mockResolvedValue({ token: 'token', userId: uuid, waitingNumber: 0 })

            const requestDto = new GenerateTokenRequestDto(uuid)
            const result = await generateTokenUseCase.execute(requestDto)

            expect(typeof result.token).toBe('string')
            expect(result.userId).toBe(uuid)
            expect(result.waitingNumber).toBe(0)
        })

        it('generateTokenUseCase response is waiting', async () => {
            const uuid = uuidv4()

            mockUserReaderRepo.findUserById.mockResolvedValue({ id: uuid, name: 'name' })
            mockWaitingReaderRedisRepo.getValidTokenByUserId.mockResolvedValue(null)
            mockWaitingReaderRedisRepo.getWaitingNumber.mockResolvedValue(1)
            mockWaitingReaderRedisRepo.isValidTokenCountUnderThreshold.mockResolvedValue(true)
            mockWaitingReaderRedisRepo.isWaitingQueueEmpty.mockResolvedValue(true)
            mockWaitingWriterRedisRepo.createValidTokenOrWaitingUser.mockResolvedValue({ token: 'token', userId: uuid, waitingNumber: 1 })

            const requestDto = new GenerateTokenRequestDto(uuid)
            const result = await generateTokenUseCase.execute(requestDto)

            expect(typeof result.token).toBe('string')
            expect(result.userId).toBe(uuid)
            expect(result.waitingNumber).toBe(1)
        })
    })
})
