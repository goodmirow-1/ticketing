import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'
import { EntityManager } from 'typeorm'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

describe('AppController (e2e)', () => {
    let app: INestApplication
    let entityManager: EntityManager

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AppModule,
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
                            logging: false,
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
})
