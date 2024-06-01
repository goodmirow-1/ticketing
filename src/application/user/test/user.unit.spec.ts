import { initDataAccesorMock } from '../../../infrastructure/db/data-accesor.interface'
import { initUserReaderMockRepo, initUserWriterMockRepo } from '../../../domain/user/test/user.mock'
import { v4 as uuidv4 } from 'uuid'
import { ChargeUserPointUseCase } from '../usecase/charge-user-point.usecase'
import { CreateUserUseCase } from '../usecase/create-user.usecase'
import { ReadUserPointUseCase } from '../usecase/read-user-point.usecase'
import { CreateUserRequestDto } from 'src/application/user/dtos/create-user.dto'
import { ChargeUserPointRequestDto } from 'src/application/user/dtos/charge-user-point.dto'
import { ReadUserPointRequestDto } from 'src/application/user/dtos/read-user-point.dto'
import { initWaitingReaderRedisMockRepo, initWaitingWriterRedisMockRepo } from 'src/domain/user/test/waiting.mock'
import { GenerateTokenUseCase } from '../usecase/generate-token.usecase'
import { GenerateTokenRequestDto } from '../dtos/generate-token.dto'
import { CheckWaitingUseCase } from '../usecase/check-waiting.usecase'
import { CheckWaitingRequestDto } from '../dtos/check-waiting.dto'

describe('유저 서비스 유닛 테스트', () => {
    let mockReaderRepo: ReturnType<typeof initUserReaderMockRepo>
    let mockWriterRepo: ReturnType<typeof initUserWriterMockRepo>
    let mockWaitingReaderRedisRepo: ReturnType<typeof initWaitingReaderRedisMockRepo>
    let mockWaitingWriterRedisRepo: ReturnType<typeof initWaitingWriterRedisMockRepo>
    let mockDataAccessor: ReturnType<typeof initDataAccesorMock>
    let chargeUserPointUseCase: ChargeUserPointUseCase
    let createUserUseCase: CreateUserUseCase
    let readUserPointUseCase: ReadUserPointUseCase
    let generateTokenUseCase: GenerateTokenUseCase
    let checkWaitingUseCase: CheckWaitingUseCase

    beforeEach(() => {
        mockReaderRepo = initUserReaderMockRepo()
        mockWriterRepo = initUserWriterMockRepo()
        mockWaitingReaderRedisRepo = initWaitingReaderRedisMockRepo()
        mockWaitingWriterRedisRepo = initWaitingWriterRedisMockRepo()
        mockDataAccessor = initDataAccesorMock()
        chargeUserPointUseCase = new ChargeUserPointUseCase(mockReaderRepo, mockWriterRepo, mockDataAccessor)
        createUserUseCase = new CreateUserUseCase(mockWriterRepo)
        readUserPointUseCase = new ReadUserPointUseCase(mockReaderRepo)
        generateTokenUseCase = new GenerateTokenUseCase(mockWaitingWriterRedisRepo)
        checkWaitingUseCase = new CheckWaitingUseCase(mockWaitingReaderRedisRepo)
    })

    describe('유저 포인트 API', () => {
        it('createUser is success', async () => {
            const uuid = uuidv4()

            mockWriterRepo.createUser.mockResolvedValue({ id: uuid, name: 'test', point: 0, reservations: [] })

            const requestDto = new CreateUserRequestDto('test')
            const result = await createUserUseCase.execute(requestDto)

            expect(result.name).toBe('test')
        })

        it('readUserPoint is success', async () => {
            const uuid = uuidv4()

            mockReaderRepo.findUserById.mockResolvedValue({ id: uuid, point: 100 })

            const requestDto = new ReadUserPointRequestDto(uuid)
            const result = await readUserPointUseCase.execute(requestDto)

            expect(result.point).toBe(100)
        })

        it('chargePoint is success', async () => {
            const uuid = uuidv4()

            mockReaderRepo.acquireLock.mockResolvedValue(true)
            mockReaderRepo.findUserById.mockResolvedValue({ id: uuid, name: 'test', point: 0, reservations: [] })
            mockWriterRepo.calculatePoint.mockResolvedValue(true)
            mockWriterRepo.createPointHistory.mockResolvedValue({ id: '1', user: { id: uuid }, amount: 1, reason: 'charge' })

            const requestDto = new ChargeUserPointRequestDto('1', 100)
            const result = await chargeUserPointUseCase.execute(requestDto)

            expect(result.amount).toBe(1)
        })
    })

    describe('유저 토큰 발급 API', () => {
        it('generateTokenUseCase response is waiting success', async () => {
            const uuid = uuidv4()

            const requestDto = new GenerateTokenRequestDto(uuid)

            mockWaitingWriterRedisRepo.enqueueWaitingUser.mockResolvedValue({ token: null, waitingNumber: 1 })

            const result = await generateTokenUseCase.execute(requestDto)

            expect(result.token).toBe(null)
            expect(result.userId).toBe(uuid)
            expect(result.waitingNumber).toBeGreaterThan(0)
        })
    })

    describe('유저 대기열 확인 API', () => {
        it('checkWaitingUseCase response is valid token', async () => {
            const uuid = uuidv4()

            const requestDto = new CheckWaitingRequestDto(uuid, 0)

            mockWaitingReaderRedisRepo.getValidTokenByUserId.mockResolvedValue('token')

            const result = await checkWaitingUseCase.execute(requestDto)

            expect(typeof result.token).toBe('string')
            expect(result.userId).toBe(uuid)
            expect(result.waitingNumber).toBe(0)
        })

        it('checkWaitingUseCase response is waiting', async () => {
            const uuid = uuidv4()

            const requestDto = new CheckWaitingRequestDto(uuid, 1)

            mockWaitingReaderRedisRepo.getValidTokenByUserId.mockResolvedValue(null)
            mockWaitingReaderRedisRepo.getWaitingNumber.mockResolvedValue(1)

            const result = await checkWaitingUseCase.execute(requestDto)

            expect(result.token).toBe(null)
            expect(result.userId).toBe(uuid)
            expect(result.waitingNumber).toBe(1)
        })

        it('checkWaitingUseCase response is not waiting', async () => {
            const uuid = uuidv4()

            const requestDto = new CheckWaitingRequestDto(uuid, -1)

            mockWaitingReaderRedisRepo.getValidTokenByUserId.mockResolvedValue(null)
            mockWaitingReaderRedisRepo.getWaitingNumber.mockResolvedValue(-1)

            const result = await checkWaitingUseCase.execute(requestDto)

            expect(result.token).toBe(null)
            expect(result.userId).toBe(uuid)
            expect(result.waitingNumber).toBe(-1)
        })
    })
})
