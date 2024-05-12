import { initDataAccesorMock } from '../../../infrastructure/db/data-accesor.interface'
import { initUserReaderMockRepo, initUserWriterMockRepo } from '../../../domain/user/test/user.mock'
import { v4 as uuidv4 } from 'uuid'
import { ChargeUserPointUseCase } from '../usecase/charge-user-point.usecase'
import { CreateUserUseCase } from '../usecase/create-user.usecase'
import { ReadUserPointUseCase } from '../usecase/read-user-point.usecase'
import { CreateUserRequestDto } from 'src/application/user/dtos/create-user.dto'
import { ChargeUserPointRequestDto } from 'src/application/user/dtos/charge-user-point.dto'
import { ReadUserPointRequestDto } from 'src/application/user/dtos/read-user-point.dto'

describe('유저 서비스 유닛 테스트', () => {
    let mockReaderRepo: ReturnType<typeof initUserReaderMockRepo>
    let mockWriterRepo: ReturnType<typeof initUserWriterMockRepo>
    let mockDataAccessor: ReturnType<typeof initDataAccesorMock>
    let chargeUserPointUseCase: ChargeUserPointUseCase
    let createUserUseCase: CreateUserUseCase
    let readUserPointUseCase: ReadUserPointUseCase

    beforeEach(() => {
        mockReaderRepo = initUserReaderMockRepo()
        mockWriterRepo = initUserWriterMockRepo()
        mockDataAccessor = initDataAccesorMock()
        chargeUserPointUseCase = new ChargeUserPointUseCase(mockReaderRepo, mockWriterRepo, mockDataAccessor)
        createUserUseCase = new CreateUserUseCase(mockWriterRepo)
        readUserPointUseCase = new ReadUserPointUseCase(mockReaderRepo)
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

            mockReaderRepo.findUserPointById.mockResolvedValue(100)

            const requestDto = new ReadUserPointRequestDto(uuid)
            const result = await readUserPointUseCase.execute(requestDto)

            expect(result.point).toBe(100)
        })

        it('chargePoint is success', async () => {
            const uuid = uuidv4()

            mockReaderRepo.findUserById.mockResolvedValue({ id: uuid, name: 'test', point: 0, reservations: [] })
            mockWriterRepo.calculatePoint.mockResolvedValue(true)
            mockWriterRepo.createPointHistory.mockResolvedValue({ id: '1', user: { id: uuid }, amount: 1, reason: 'charge' })

            const requestDto = new ChargeUserPointRequestDto('1', 100)
            const result = await chargeUserPointUseCase.execute(requestDto)

            expect(result.amount).toBe(1)
        })
    })
})
