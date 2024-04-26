import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import type { INestApplication } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { AppModule } from 'src/app.module'
import { ChargeUserPointUseCase } from 'src/application/user/usecase/charge-user-point.usecase'
import { CreateUserUseCase } from 'src/application/user/usecase/create-user.usecase'
import { ReadUserPointUseCase } from 'src/application/user/usecase/read-user-point.usecase'
import { CreateUserRequestDto } from 'src/application/user/dtos/create-user.dto'
import { ChargeUserPointRequestDto } from 'src/application/user/dtos/charge-user-point.dto'
import { NotFoundUserError } from 'src/domain/user/exceptions/not-found-user.exception'
import { InValidPointError } from 'src/domain/user/exceptions/invalid-point.exception'
import { ReadUserPointRequestDto } from 'src/application/user/dtos/read-user-point.dto'

describe('Integration Tests for User Use Cases', () => {
    let app: INestApplication
    let entityManager: EntityManager
    let chargeUserPointUseCase: ChargeUserPointUseCase
    let createUserUseCase: CreateUserUseCase
    let readUserPointUseCase: ReadUserPointUseCase

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()

        entityManager = moduleFixture.get(EntityManager)
        chargeUserPointUseCase = moduleFixture.get(ChargeUserPointUseCase)
        createUserUseCase = moduleFixture.get(CreateUserUseCase)
        readUserPointUseCase = moduleFixture.get(ReadUserPointUseCase)
    })

    afterAll(async () => {
        await app.close()
    })

    afterEach(async () => {
        await entityManager.delete('point_history', {})
        await entityManager.delete('user', {})
    })

    const getUserID = async () => {
        const requestDto = new CreateUserRequestDto('tester')
        const result = await createUserUseCase.execute(requestDto)

        expect(result.name).toBe('tester')

        return result.id
    }

    describe('CreateUserUseCase', () => {
        it('should create a successfully', async () => {
            const requestDto = new CreateUserRequestDto('tester')
            const result = await createUserUseCase.execute(requestDto)

            expect(result.name).toBe('tester')
        })
    })

    describe('ChargeUserPointUseCase', () => {
        it('should charge a user point is InValidPointError', async () => {
            const requestDto = new ChargeUserPointRequestDto('1', -1)

            await expect(chargeUserPointUseCase.execute(requestDto)).rejects.toThrow(InValidPointError)
        })

        it('should charge a user point is NotFoundUserError', async () => {
            const requestDto = new ChargeUserPointRequestDto('1', 10000)

            await expect(chargeUserPointUseCase.execute(requestDto)).rejects.toThrow(NotFoundUserError)
        })

        it('should charge a user point a successfully', async () => {
            const userId = await getUserID()

            const requestDto = new ChargeUserPointRequestDto(userId, 10000)
            const result = await chargeUserPointUseCase.execute(requestDto)

            expect(result.amount).toBe(10000)
        })
    })

    describe('ReadUserPointUseCase', () => {
        it('should read a user point is NotFoundUserError ', async () => {
            const requestDto = new ReadUserPointRequestDto('1')

            await expect(readUserPointUseCase.execute(requestDto)).rejects.toThrow(NotFoundUserError)
        })

        it('should read a successfully', async () => {
            const userId = await getUserID()

            const requestDto = new ReadUserPointRequestDto(userId)
            const result = await readUserPointUseCase.execute(requestDto)

            expect(typeof result.point).toBe('number')
        })
    })
})
