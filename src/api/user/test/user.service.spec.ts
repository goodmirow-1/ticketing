import { initDataAccesorMock } from '../../../infrastructure/db/data-accesor.interface'
import { initUserReaderMockRepo, initUserWriterMockRepo, setValidToken, setWaitingUserToken } from './user.service.mock'
import { v4 as uuidv4 } from 'uuid'
import { InValidPointError } from '../../../domain/user/exceptions/invalid-point.exception'
import { ChargeUserPointUseCase } from '../usecase/charge-user-point.usecase'
import { CreateUserUseCase } from '../usecase/create-user.usecase'
import { GenerateTokenUseCase } from '../usecase/generate-token.usecase'
import { ReadUserPointUseCase } from '../usecase/read-user-point.usecase'
import { extractToken } from '../../../domain/user/common/jwt-token.util'

describe('유저 서비스 유닛 테스트', () => {
    let mockReaderRepo: ReturnType<typeof initUserReaderMockRepo>
    let mockWriterRepo: ReturnType<typeof initUserWriterMockRepo>
    let mockDataAccessor: ReturnType<typeof initDataAccesorMock>
    let chargeUserPointUseCase: ChargeUserPointUseCase
    let createUserUseCase: CreateUserUseCase
    let generateTokenUseCase: GenerateTokenUseCase
    let readUserPointUseCase: ReadUserPointUseCase

    beforeEach(() => {
        mockReaderRepo = initUserReaderMockRepo()
        mockWriterRepo = initUserWriterMockRepo()
        mockDataAccessor = initDataAccesorMock()
        chargeUserPointUseCase = new ChargeUserPointUseCase(mockReaderRepo, mockWriterRepo, mockDataAccessor)
        createUserUseCase = new CreateUserUseCase(mockWriterRepo)
        generateTokenUseCase = new GenerateTokenUseCase(mockReaderRepo, mockWriterRepo, mockDataAccessor)
        readUserPointUseCase = new ReadUserPointUseCase(mockReaderRepo)
    })

    describe('유저 토큰 발급 API', () => {
        it('isTokenCountUnderThreshold is true waitnumber is 0', async () => {
            const uuid = uuidv4()

            setValidToken(mockReaderRepo, mockWriterRepo)

            const token = extractToken(await generateTokenUseCase.excute(uuid))

            expect(token.uuid).toBe(uuid)
            expect(token.waitNumber).toBe(0)
        })

        it('isTokenCountUnderThreshold is false waitnumber is 1', async () => {
            const uuid = uuidv4()

            setWaitingUserToken(mockReaderRepo, mockWriterRepo)

            const token = extractToken(await generateTokenUseCase.excute(uuid))

            expect(token.uuid).toBe(uuid)
            expect(token.waitNumber).toBe(1)
        })
    })

    describe('유저 포인트 API', () => {
        it('createUser is success', async () => {
            const uuid = uuidv4()

            mockWriterRepo.createUser.mockResolvedValue({ id: uuid, name: 'test', point: 0, reservations: [] })

            const result = await createUserUseCase.excute('test')

            expect(result.name).toBe('test')
        })

        it('readUserPoint is success', async () => {
            const uuid = uuidv4()

            mockReaderRepo.findUserPointById.mockResolvedValue(100)

            const result = await readUserPointUseCase.excute(uuid)

            expect(result).toBe(100)
        })

        it('chargePoint is failed cause point is invalid', async () => {
            mockWriterRepo.checkValidPoint.mockImplementation(() => {
                throw new InValidPointError()
            })

            await expect(chargeUserPointUseCase.excute('1', 100)).rejects.toThrow(InValidPointError)
        })

        it('chargePoint is success', async () => {
            const uuid = uuidv4()

            mockReaderRepo.findUserById.mockResolvedValue({ id: uuid, name: 'test', point: 0, reservations: [] })
            mockWriterRepo.calculatePoint.mockResolvedValue({ id: '1', user: { id: uuid }, amount: 1, reason: 'charge' })

            const result = await chargeUserPointUseCase.excute('1', 100)

            expect(result).toBe(1)
        })
    })
})
