const express = require('express')
const app = express()

const VERSION = require('../package.json').version || 'none'

app.get('/version', (_, res) => {
    res.status(200).json({
        version: VERSION
    })
})

module.exports = app
