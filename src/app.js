const express = require('express')
const app = express()
const { httpRequestDurationMicroseconds, register } = require('./metrics')

const VERSION = require('../package.json').version || 'none'

app.get('/version', (req, res) => {
    const end = httpRequestDurationMicroseconds.startTimer()
    res.status(200).json({
        version: VERSION
    })
    end({ route: req.url, code: res.statusCode, method: req.method })
})

app.get('/metrics', (req, res) => {
    const end = httpRequestDurationMicroseconds.startTimer()
    res.status(200).end(register.metrics())
    end({ route: req.url, code: res.statusCode, method: req.method })
})

app.get('/', (req, res) => {
    const end = httpRequestDurationMicroseconds.startTimer()
    res.status(200).send('Yay metrics!')
    end({ route: req.url, code: res.statusCode, method: req.method })
})

module.exports = app
