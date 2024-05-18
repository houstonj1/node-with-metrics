import { readFileSync } from "fs"
import request from "supertest"
import app from "../app"

const version = JSON.parse(readFileSync("./package.json")).version || "none"

describe("/version", () => {
  test("It should respond with a 200", async () => {
    const response = await request(app).get("/version")
    expect(response.statusCode).toBe(200)
  })

  test("It should respond with the correct package version", async () => {
    const response = await request(app).get("/version")
    expect(response.body.version).toBe(version)
  })
})

describe("/metrics", () => {
  test("It should respond with a 200", async () => {
    const response = await request(app).get("/metrics")
    expect(response.statusCode).toBe(200)
  })
})
