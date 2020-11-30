const request = require('supertest')
const app = require('../app')

const VERSION = require('../../package.json').version

describe('/version', () => {
    test("It should respond with a 200", async () => {
        const response = await request(app).get('/version')
        expect(response.statusCode).toBe(200)
    })

    test("It should respond with the correct package version", async () => {
        const response = await request(app).get('/version')
        expect(response.body.version).toBe(VERSION)
    })
})

describe('/metrics', () => {
    test("It should respond with a 200", async () => {
        const response = await request(app).get('/metrics')
        expect(response.statusCode).toBe(200)
    })
})
