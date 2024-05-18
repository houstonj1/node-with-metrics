import { readFileSync } from "fs"
import express, { Express } from "express"
import { httpRequestDurationMicroseconds, register } from "./metrics.js"

const app: Express = express()
const version =
  JSON.parse(readFileSync("./package.json").toString()).version || "none"

app.get("/version", (req, res) => {
  const end = httpRequestDurationMicroseconds.startTimer()
  res.status(200).json({
    version,
  })
  end({ route: req.url, code: res.statusCode, method: req.method })
})

app.get("/metrics", async (req, res) => {
  const end = httpRequestDurationMicroseconds.startTimer()
  res.status(200).end(await register.metrics())
  end({ route: req.url, code: res.statusCode, method: req.method })
})

app.get("/", (req, res) => {
  const end = httpRequestDurationMicroseconds.startTimer()
  res.status(200).send("Yay metrics!")
  end({ route: req.url, code: res.statusCode, method: req.method })
})

export default app
