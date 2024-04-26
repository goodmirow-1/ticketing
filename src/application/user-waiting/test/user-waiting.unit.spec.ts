import { initUserReaderMockRepo } from '../../../domain/user/test/user.mock'
import { GenerateTokenUseCase } from '../usecase/generate-token.usecase'
import { initWaitingReaderMockRepo, initWaitingWriterMockRepo } from '../../../domain/waiting/test/waiting.mock'
import { initDataAccesorMock } from '../../../infrastructure/db/data-accesor.interface'
import { v4 as uuidv4 } from 'uuid'
import { GenerateTokenRequestDto } from 'src/application/user-waiting/dtos/generate-token.dto'
import { GenerateWaitingTokenRequestDto } from 'src/application/user-waiting/dtos/generate.waiting-token.dto'

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
        mockDataAccessor.getSession.mockResolvedValue({ id: 'id' })
        mockDataAccessor.commitTransaction.mockResolvedValue(undefined)
        mockDataAccessor.rollbackTransaction.mockResolvedValue(undefined)
        mockDataAccessor.releaseQueryRunner.mockResolvedValue(undefined)
    })

    describe('유저 토큰 발급 API', () => {
        it('generateTokenUseCase response is valid token', async () => {
            const uuid = uuidv4()

            mockUserReaderRepo.findUserById.mockResolvedValue({ id: uuid, name: 'name' })
            mockWaitingReaderRepo.isValidTokenCountUnderThreshold.mockResolvedValue(true)
            mockWaitingWriterRepo.createValidTokenOrWaitingUser.mockResolvedValue({ token: 'token', waitingNumber: 0 })

            const requestDto = new GenerateTokenRequestDto(uuid)
            const result = await generateTokenUseCase.execute(requestDto)
            expect(typeof result.token).toBe('string')
        })

        it('generateTokenUseCase response is waiting', async () => {
            const uuid = uuidv4()

            mockUserReaderRepo.findUserById.mockResolvedValue({ id: uuid, name: 'name' })
            mockWaitingReaderRepo.isValidTokenCountUnderThreshold.mockResolvedValue(false)
            mockWaitingWriterRepo.createValidTokenOrWaitingUser.mockResolvedValue({ token: 'token', waitingNumber: 1 })

            const requestDto = new GenerateWaitingTokenRequestDto(uuid)
            const result = await generateTokenUseCase.execute(requestDto)

            expect(typeof result.token).toBe('string')
        })
    })
})
