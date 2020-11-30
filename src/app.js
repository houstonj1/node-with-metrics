const express = require('express')
const app = express()
const register = require('./metrics')

const VERSION = require('../package.json').version || 'none'

app.get('/version', (_, res) => {
    res.status(200).json({
        version: VERSION
    })
})

app.get('/metrics', (_, res) => {
    res.status(200).end(register.metrics())
})

module.exports = app
