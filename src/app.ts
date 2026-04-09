import express, { Express, Request, Response, NextFunction } from "express"
import {
  getTraceExemplar,
  httpRequestDuration,
  httpRequestTotal,
  httpRequestsInFlight,
  httpResponseSize,
  itemsProcessed,
  register,
  version,
} from "./metrics.js"

const app: Express = express()

const EXCLUDED_PATHS = new Set(["/metrics", "/healthz", "/readyz"])

app.use((req, res, next) => {
  if (EXCLUDED_PATHS.has(req.path)) return next()
  httpRequestsInFlight.inc()
  const exemplar = getTraceExemplar()
  const end = httpRequestDuration.startTimer({}, {})
  res.on("finish", () => {
    const route =
      (req.route?.path as string) ||
      (res.statusCode === 404 ? "unmatched" : req.path)
    const labels = { route, code: res.statusCode, method: req.method }
    end(labels, exemplar)
    httpRequestTotal.inc(labels)
    httpRequestsInFlight.dec()
    const contentLength = Number(res.getHeader("content-length") || 0)
    if (contentLength > 0) {
      httpResponseSize.observe(labels, contentLength)
    }
  })
  next()
})

app.get("/version", (req, res) => {
  res.status(200).json({ version })
})

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType)
  res.status(200).end(await register.metrics())
})

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" })
})

let ready = true
export function setReady(value: boolean) {
  ready = value
}

app.get("/readyz", (_req, res) => {
  if (ready) {
    res.status(200).json({ status: "ready" })
  } else {
    res.status(503).json({ status: "not ready" })
  }
})

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

app.post("/items", async (_req, res) => {
  await sleep(Math.random() * 3000)
  itemsProcessed.inc({ status: "success" })
  res.status(201).json({ status: "created" })
})

app.get("/error", (_req, res) => {
  res.status(500).json({ error: "Internal Server Error" })
})

app.get("/", (_req, res) => {
  res.status(200).send("Yay metrics!")
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(`Unhandled error on ${req.method} ${req.path}:`, err.message)
  res.status(500).json({ error: "Internal Server Error" })
})

export default app
