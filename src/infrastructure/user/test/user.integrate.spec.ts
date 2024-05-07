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
import { GenerateTokenUseCase } from 'src/application/user/usecase/generate-token.usecase'
import { GenerateTokenRequestDto } from 'src/application/user/dtos/generate-token.dto'
import { v4 as uuidv4 } from 'uuid'
import { RedisService } from 'src/infrastructure/db/redis/redis-service'

describe('Integration Tests for User Use Cases', () => {
    let app: INestApplication
    let entityManager: EntityManager
    let chargeUserPointUseCase: ChargeUserPointUseCase
    let createUserUseCase: CreateUserUseCase
    let readUserPointUseCase: ReadUserPointUseCase
    let generateTokenUseCase: GenerateTokenUseCase
    let redisService: RedisService

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()

        entityManager = moduleFixture.get(EntityManager)
        redisService = moduleFixture.get(RedisService)
        chargeUserPointUseCase = moduleFixture.get(ChargeUserPointUseCase)
        createUserUseCase = moduleFixture.get(CreateUserUseCase)
        readUserPointUseCase = moduleFixture.get(ReadUserPointUseCase)
        generateTokenUseCase = moduleFixture.get(GenerateTokenUseCase)

        await redisService.clearAllData()
    })

    afterAll(async () => {
        await app.close()
    })

    afterEach(async () => {
        await redisService.clearAllData()
        await entityManager.delete('point_history', {})
        await entityManager.delete('user', {})
    })

    const getUserID = async (name: string) => {
        const requestDto = new CreateUserRequestDto(name)
        const result = await createUserUseCase.execute(requestDto)

        expect(result.name).toBe(name)

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
            const userId = await getUserID('tester')

            const requestDto = new ChargeUserPointRequestDto(userId, 10000)
            const result = await chargeUserPointUseCase.execute(requestDto)

            expect(result.amount).toBe(10000)
        })

        it('should accumulate points correctly when charged ten times concurrently', async () => {
            const userId = await getUserID('tester')

            // Set the point amount to be charged each time
            const pointAmount = 10000
            const numberOfCharges = 10

            // Create an array of promises for charging points concurrently
            const chargePromises = []
            for (let i = 0; i < numberOfCharges; i++) {
                const requestDto = new ChargeUserPointRequestDto(userId, pointAmount)
                chargePromises.push(chargeUserPointUseCase.execute(requestDto))
            }

            // Execute all charge operations simultaneously
            await Promise.all(chargePromises)

            // Check the final points balance
            const finalPointStatus = await readUserPointUseCase.execute(new ReadUserPointRequestDto(userId))

            // The expected total points should be the point amount times the number of charges
            const expectedTotalPoints = pointAmount * numberOfCharges
            expect(finalPointStatus.point).toBe(expectedTotalPoints)
        })
    })

    describe('ReadUserPointUseCase', () => {
        it('should read a user point is NotFoundUserError ', async () => {
            const requestDto = new ReadUserPointRequestDto('1')

            await expect(readUserPointUseCase.execute(requestDto)).rejects.toThrow(NotFoundUserError)
        })

        it('should read a successfully', async () => {
            const userId = await getUserID('tester')

            const requestDto = new ReadUserPointRequestDto(userId)
            const result = await readUserPointUseCase.execute(requestDto)

            expect(typeof result.point).toBe('number')
        })
    })

    describe('GenerateTokenUseCase', () => {
        it('should generate token is NotFoundUserError', async () => {
            const requestDto = new GenerateTokenRequestDto('1')

            await expect(generateTokenUseCase.execute(requestDto)).rejects.toThrow(NotFoundUserError)
        })

        it('should generate valid and waiting token is successfully', async () => {
            const requestUserId = await getUserID('tester')
            const requestDtoOne = new GenerateTokenRequestDto(requestUserId)
            const resultOne = await generateTokenUseCase.execute(requestDtoOne)

            expect(resultOne.waitingNumber).toBe(0)

            for (let i = 0; i < parseInt(process.env.MAX_CONNECTIONS, 10); i++) {
                const uuid = uuidv4()
                const userId = await getUserID(uuid)
                const requestDto = new GenerateTokenRequestDto(userId)
                await generateTokenUseCase.execute(requestDto)
            }

            const userId = await getUserID('tester')
            const requestDto = new GenerateTokenRequestDto(userId)
            const result = await generateTokenUseCase.execute(requestDto)

            expect(result.waitingNumber).toBeGreaterThanOrEqual(1)
        })

        it(
            'should manage user tokens correctly under maximum load',
            async () => {
                const maxConnect = parseInt(process.env.MAX_CONNECTIONS, 10)
                const userNames = Array.from({ length: 2 * maxConnect }, () => uuidv4()) // Generate double the MAX_CONNECT user IDs

                const userIds = []
                for (let i = 0; i < userNames.length; ++i) {
                    const requestDto = new CreateUserRequestDto(userNames[i])
                    const user = await createUserUseCase.execute(requestDto)
                    userIds.push(user.id)
                }

                // Simulate multiple token requests simultaneously
                const tokenPromises = userIds.map(userId => {
                    const requestDto = new GenerateTokenRequestDto(userId)
                    return generateTokenUseCase.execute(requestDto)
                })

                const results = await Promise.allSettled(tokenPromises)

                let validTokenCount = 0
                let waitingCount = 0
                const countResults = results.map(response => {
                    if (response.status === 'fulfilled') {
                        if (response.value.token) {
                            validTokenCount++
                        } else {
                            waitingCount++
                        }
                    } else {
                        return Promise.resolve(null) // 응답이 실패했거나 조건을 만족하지 못하는 경우, null 반환
                    }
                })

                await Promise.allSettled(countResults)

                expect(validTokenCount).toBeLessThanOrEqual(userIds.length)
                expect(waitingCount).toBeGreaterThanOrEqual(1)
            },
            6000 * 1000,
        )
    })
})
