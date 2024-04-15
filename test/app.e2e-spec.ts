import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import { HttpStatus, type INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { EntityManager } from 'typeorm'
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConcertModule } from 'src/api/concert/concert.module'
import { WaitingModule } from 'src/api/waiting/waiting.module'
import { UserConcertWaitingModule } from 'src/api/user-concert-waiting/user-concert-waiting.module'
import { UserModule } from 'src/api/user/user.module'
import { UserWaitingModule } from 'src/api/user-waiting/user-waiting.module'
import { ConfigModule } from '@nestjs/config'

describe('AppController (e2e)', () => {
    let app: INestApplication
    let entityManager: EntityManager

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AppModule,
                UserModule,
                ConcertModule,
                WaitingModule,
                UserConcertWaitingModule,
                UserWaitingModule,

                ConfigModule.forRoot({
                    envFilePath: '.env',
                    isGlobal: true,
                }),

                TypeOrmModule.forRootAsync({
                    useFactory: async () => {
                        return {
                            type: process.env.DB_TYPE,
                            host: process.env.DB_HOST,
                            port: process.env.DB_PORT,
                            username: process.env.DB_USER_NAME,
                            password: process.env.DB_PASSWORD,
                            database: process.env.DATABASE,
                            entities: [__dirname + '/**/*.entity{.ts,.js}'],
                            synchronize: true,
                            logging: true,
                        } as TypeOrmModuleOptions
                    },
                }),
            ],
        }).compile()

        app = moduleFixture.createNestApplication()
        await app.init()

        entityManager = moduleFixture.get(EntityManager)
    })

    afterAll(async () => {
        await app.close()
    })

    it('should handle the token issuance and concert access process', async () => {
        // 1. 토큰 발급 요청
        const tokenResponse = await request(app.getHttpServer()).post('/user-waiting/{userId}/generateToken').send({ userId: 'some-user-id' })

        expect(tokenResponse.status).toBe(HttpStatus.OK)

        const token = tokenResponse.body.token
        let waitingNumber = tokenResponse.body.waitingNumber

        // 2. 유효 토큰일 경우
        if (waitingNumber === 0) {
            const concertResponse = await request(app.getHttpServer()).get('v1/concert/').set('Authorization', `Bearer ${token}`)

            expect(concertResponse.status).toBe(HttpStatus.OK)
        } else {
            // 3. 대기 토큰일 경우
            while (waitingNumber !== 0) {
                // 4. 폴링 주기 조정 (대기번호에 따라 다르게 설정)
                const delay = calculatePollingDelay(waitingNumber)

                await new Promise(resolve => setTimeout(resolve, delay))

                const statusResponse = await request(app.getHttpServer()).post('/user-waiting/token/status').send({ token })

                waitingNumber = statusResponse.body.waitingNumber

                // 5. 0번이 되었을 경우
                if (waitingNumber === 0) {
                    const concertResponse = await request(app.getHttpServer()).get('v1/concert/').set('Authorization', `Bearer ${token}`)

                    expect(concertResponse.status).toBe(HttpStatus.OK)
                    break
                }
            }
        }
    })

    // 폴링 주기를 계산하는 함수 (대기번호에 따라 다른 주기를 반환)
    function calculatePollingDelay(waitingNumber: number): number {
        // 여기에 대기번호에 따른 폴링 주기 로직 구현
        // 예: 대기번호가 높을수록 긴 대기 시간을 설정
        return 1000 * Math.min(waitingNumber, 10) // 최대 10초 대기
    }
})
