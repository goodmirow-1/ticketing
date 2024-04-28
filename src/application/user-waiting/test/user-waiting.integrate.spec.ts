import type { INestApplication } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { AppModule } from 'src/app.module'
import { GenerateTokenUseCase } from 'src/application/user-waiting/usecase/generate-token.usecase'
import { GenerateWaitingTokenUseCase } from 'src/application/user-waiting/usecase/generate-waiting-token.usecase'
import { CreateUserRequestDto } from 'src/application/user/dtos/create-user.dto'
import { CreateUserUseCase } from 'src/application/user/usecase/create-user.usecase'
import { EntityManager } from 'typeorm'
import { GenerateTokenRequestDto } from '../dtos/generate-token.dto'
import { NotFoundUserError } from 'src/domain/user/exceptions/not-found-user.exception'
import { v4 as uuidv4 } from 'uuid'
import { GenerateWaitingTokenRequestDto } from '../dtos/generate.waiting-token.dto'

describe('Integration Tests for User Use Cases', () => {
    let app: INestApplication
    let entityManager: EntityManager
    let createUserUseCase: CreateUserUseCase
    let generateTokenUseCase: GenerateTokenUseCase
    let generateWaitingTokenUseCase: GenerateWaitingTokenUseCase

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()

        entityManager = moduleFixture.get(EntityManager)
        createUserUseCase = moduleFixture.get(CreateUserUseCase)
        generateTokenUseCase = moduleFixture.get(GenerateTokenUseCase)
        generateWaitingTokenUseCase = moduleFixture.get(GenerateWaitingTokenUseCase)
    })

    afterAll(async () => {
        await app.close()
    })

    afterEach(async () => {
        await entityManager.delete('point_history', {})
        await entityManager.delete('waiting_user', {})
        await entityManager.delete('valid_token', {})
        await entityManager.delete('user', {})
    })

    const getUserID = async (name: string) => {
        const requestDto = new CreateUserRequestDto(name)
        const result = await createUserUseCase.execute(requestDto)

        expect(result.name).toBe(name)

        return result.id
    }

    describe('GenerateTokenUseCase', () => {
        it('should generate token is NotFoundUserError', async () => {
            const requestDto = new GenerateTokenRequestDto('1')

            await expect(generateTokenUseCase.execute(requestDto)).rejects.toThrow(NotFoundUserError)
        })

        it('should generate valid token is successfully', async () => {
            const userId = await getUserID('tester')

            const requestDto = new GenerateTokenRequestDto(userId)
            const result = await generateTokenUseCase.execute(requestDto)

            expect(result.waitingNumber).toBe(0)
        })

        it('should generate waiting token is successfully', async () => {
            for (let i = 0; i < parseInt(process.env.MAX_CONNECTIONS, 10); i++) {
                const uuid = uuidv4()
                const userId = await getUserID(uuid)
                const requestDto = new GenerateTokenRequestDto(userId)
                const result = await generateTokenUseCase.execute(requestDto)
                expect(result.waitingNumber).toBe(0)
            }

            const userId = await getUserID('tester')

            const requestDto = new GenerateTokenRequestDto(userId)
            const result = await generateTokenUseCase.execute(requestDto)

            expect(result.waitingNumber).toBe(1)
        })
    })

    describe('GenerateWaitingTokenUseCase', () => {
        it('should generate waiting token is valid', async () => {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const uuid = uuidv4()
            const userId = await getUserID(uuid)
            const requestDto = new GenerateTokenRequestDto(userId)
            await generateTokenUseCase.execute(requestDto)

            const requestWaitingDto = new GenerateWaitingTokenRequestDto(userId)
            const resultWaiting = await generateWaitingTokenUseCase.execute(requestWaitingDto)

            expect(resultWaiting.waitingNumber).toBe(0)
        })

        it('should generate waiting token is waiting', async () => {
            await new Promise(resolve => setTimeout(resolve, 1000))

            for (let i = 0; i < parseInt(process.env.MAX_CONNECTIONS, 10); i++) {
                const uuid = uuidv4()
                const userId = await getUserID(uuid)
                const requestDto = new GenerateTokenRequestDto(userId)
                const result = await generateTokenUseCase.execute(requestDto)
                expect(result.waitingNumber).toBe(0)
            }

            const userId = await getUserID('tester')

            const requestDto = new GenerateTokenRequestDto(userId)
            await generateTokenUseCase.execute(requestDto)

            const requestWaitingDto = new GenerateWaitingTokenRequestDto(userId)
            const resultWaiting = await generateWaitingTokenUseCase.execute(requestWaitingDto)

            expect(resultWaiting.waitingNumber).toBe(1)
        })
    })
})
