import { readFileSync } from "fs"
import request from "supertest"
import app, { setReady } from "../app.js"

const version =
  JSON.parse(readFileSync("./package.json").toString()).version || "none"

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

  test("It should expose app_info with version labels", async () => {
    const response = await request(app).get("/metrics")
    expect(response.text).toMatch(/app_info\{.*version="/)
    expect(response.text).toMatch(/app_info\{.*node_version="/)
  })

  test("It should expose app_start_timestamp_seconds", async () => {
    const response = await request(app).get("/metrics")
    expect(response.text).toMatch(/app_start_timestamp_seconds/)
  })

  test("It should not record metrics for the /metrics endpoint itself", async () => {
    await request(app).get("/metrics")
    const response = await request(app).get("/metrics")
    expect(response.text).not.toMatch(
      /http_requests_total\{.*route="\/metrics"/,
    )
  })

  test("It should serve OpenMetrics format", async () => {
    const response = await request(app).get("/metrics")
    expect(response.statusCode).toBe(200)
    expect(response.headers["content-type"]).toMatch(
      /application\/openmetrics-text/,
    )
  })
})

describe("/healthz", () => {
  test("It should respond with 200 and status ok", async () => {
    const response = await request(app).get("/healthz")
    expect(response.statusCode).toBe(200)
    expect(response.body.status).toBe("ok")
  })

  test("It should not record metrics for the /healthz endpoint", async () => {
    await request(app).get("/healthz")
    const response = await request(app).get("/metrics")
    expect(response.text).not.toMatch(
      /http_requests_total\{.*route="\/healthz"/,
    )
  })
})

describe("/readyz", () => {
  afterEach(() => {
    setReady(true)
  })

  test("It should respond with 200 when ready", async () => {
    const response = await request(app).get("/readyz")
    expect(response.statusCode).toBe(200)
    expect(response.body.status).toBe("ready")
  })

  test("It should respond with 503 when not ready", async () => {
    setReady(false)
    const response = await request(app).get("/readyz")
    expect(response.statusCode).toBe(503)
    expect(response.body.status).toBe("not ready")
  })

  test("It should not record metrics for the /readyz endpoint", async () => {
    await request(app).get("/readyz")
    const response = await request(app).get("/metrics")
    expect(response.text).not.toMatch(/http_requests_total\{.*route="\/readyz"/)
  })
})

describe("metrics recording", () => {
  test("It should increment http_requests_total after a request", async () => {
    await request(app).get("/")
    const response = await request(app).get("/metrics")
    expect(response.text).toMatch(
      /http_requests_total\{.*route="\/",.*code="200"/,
    )
  })

  test("It should record http_request_duration_seconds after a request", async () => {
    await request(app).get("/")
    const response = await request(app).get("/metrics")
    expect(response.text).toMatch(/http_request_duration_seconds_bucket\{/)
  })

  test("It should record http_response_size_bytes after a request", async () => {
    await request(app).get("/version")
    const response = await request(app).get("/metrics")
    expect(response.text).toMatch(/http_response_size_bytes_bucket\{/)
  })

  test("It should use route pattern instead of raw path", async () => {
    await request(app).get("/")
    const response = await request(app).get("/metrics")
    expect(response.text).toMatch(/http_requests_total\{.*route="\/"/)
    expect(response.text).not.toMatch(
      /http_requests_total\{.*route="\/metrics"/,
    )
  })

  test("It should collapse unknown routes to 'unmatched' to prevent cardinality explosion", async () => {
    await request(app).get("/no-such-route")
    await request(app).get("/also-does-not-exist")
    const response = await request(app).get("/metrics")
    expect(response.text).toMatch(
      /http_requests_total\{.*route="unmatched".*code="404"/,
    )
    expect(response.text).not.toMatch(
      /http_requests_total\{.*route="\/no-such-route"/,
    )
  })
})

describe("GET /error", () => {
  test("It should respond with 500", async () => {
    const response = await request(app).get("/error")
    expect(response.statusCode).toBe(500)
  })
})

describe("POST /items", () => {
  test("It should respond with 201 and increment items_processed_total", async () => {
    const response = await request(app).post("/items")
    expect(response.statusCode).toBe(201)
    expect(response.body.status).toBe("created")
    const metrics = await request(app).get("/metrics")
    expect(metrics.text).toMatch(/items_processed_total\{status="success".*\}/)
  })
})
