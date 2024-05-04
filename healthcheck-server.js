const express = require('express')
const redis = require('redis')

const app = express()
const client = redis.createClient({
    host: 'localhost', // Redis 호스트 설정
    port: 6379, // Redis 포트 설정
})

app.get('/health', (req, res) => {
    client.ping((err, reply) => {
        if (err) return res.status(500).send('Redis Down')
        if (reply === 'PONG') {
            res.send('OK')
        } else {
            res.status(500).send('Bad Response')
        }
    })
})

app.listen(8080, () => {
    console.log('Health check server running on port 8080')
})
