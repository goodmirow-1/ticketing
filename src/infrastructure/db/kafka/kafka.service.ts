import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import type { Consumer, Producer } from 'kafkajs'
import { Kafka, Partitioners } from 'kafkajs'

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(KafkaService.name)
    private kafka: Kafka
    private producer: Producer
    private consumer: Consumer

    constructor() {
        // this.kafka = new Kafka({
        //     clientId: 'concert-app',
        //     brokers: [process.env.KAFKA_HOST + ':9092'], // Kafka 브로커 주소
        // })
        // this.producer = this.kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner })
        // this.consumer = this.kafka.consumer({ groupId: 'reservation-group' })
    }

    async onModuleInit() {
        // await this.producer.connect()
        // await this.consumer.connect()
        // await this.consumer.subscribe({ topic: 'reservation-created-completed', fromBeginning: true })
        // await this.consumer.subscribe({ topic: 'payment-completed', fromBeginning: true })
        // await this.consumer.run({
        //     eachMessage: async ({ topic, partition, message }) => {
        //         const payload = JSON.parse(message.value.toString())
        //         this.logger.log(`Received message: ${JSON.stringify(payload)} from topic: ${topic}`)
        //         switch (topic) {
        //             case 'reservation-created-completed':
        //                 await this.handleReservationCreated(payload, partition)
        //                 break
        //             case 'payment-completed':
        //                 await this.handlePaymentCompleted(payload, partition)
        //                 break
        //             default:
        //                 this.logger.warn(`No handler for topic: ${topic}`)
        //                 break
        //         }
        //     },
        // })
    }

    async sendMessage(topic: string, message: any) {
        // try {
        //     await this.producer.send({
        //         topic,
        //         messages: [{ value: JSON.stringify(message) }],
        //     })
        // } catch (err) {
        //     console.log(err)
        // }
    }

    async onModuleDestroy() {
        //await this.consumer.disconnect()
    }

    private async handleReservationCreated(payload: any, partition: number) {
        this.logger.log(`Handling reservation created for partition: ${partition}`)
        // 외부 API 호출
        await this.sendToExternalApi(payload)
    }

    private async handlePaymentCompleted(payload: any, partition: number) {
        this.logger.log(`Handling payment completed for partition: ${partition}`)
        // 외부 API 호출
        await this.sendToExternalApi(payload)
    }

    private async sendToExternalApi(payload: any) {
        try {
            // 외부 api 호출 await this.httpService.post('http://external.api/endpoint', payload).toPromise()
            this.logger.log(`Successfully sent payload to external API: ${JSON.stringify(payload)}`)
        } catch (error) {
            this.logger.error(`Failed to send payload to external API: ${error.message}`)
        }
    }
}
