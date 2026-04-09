import { readFileSync } from "fs"
import client from "prom-client"
import { trace } from "@opentelemetry/api"

const register = new client.Registry<client.RegistryContentType>()
register.setContentType(client.openMetricsContentType)
register.setDefaultLabels({ application: "node-with-metrics" })

client.collectDefaultMetrics({ register })

const version =
  JSON.parse(readFileSync("./package.json").toString()).version || "unknown"

const appInfo = new client.Gauge({
  name: "app_info",
  help: "Application metadata exposed as labels, always set to 1",
  labelNames: ["version", "node_version"],
  registers: [register],
})
appInfo.set({ version, node_version: process.version }, 1)

const appStartTimestamp = new client.Gauge({
  name: "app_start_timestamp_seconds",
  help: "Unix timestamp when the application started, useful for detecting restarts via (time() - app_start_timestamp_seconds)",
  registers: [register],
})
appStartTimestamp.set(Date.now() / 1000)

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  enableExemplars: true,
  registers: [register],
})

const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "code"],
  registers: [register],
})

const httpRequestsInFlight = new client.Gauge({
  name: "http_requests_in_flight",
  help: "Number of HTTP requests currently being processed",
  registers: [register],
})

const httpResponseSize = new client.Histogram({
  name: "http_response_size_bytes",
  help: "Size of HTTP responses in bytes",
  labelNames: ["method", "route", "code"],
  buckets: [100, 500, 1000, 5000, 10000, 50000, 100000],
  registers: [register],
})

const itemsProcessed = new client.Counter({
  name: "items_processed_total",
  help: "Total number of items processed",
  labelNames: ["status"],
  registers: [register],
})

function getTraceExemplar(): Record<string, string> {
  const span = trace.getActiveSpan()
  if (!span) return {}
  const traceId = span.spanContext().traceId
  return { traceID: traceId }
}

export {
  appInfo,
  appStartTimestamp,
  getTraceExemplar,
  httpRequestDuration,
  httpRequestTotal,
  httpRequestsInFlight,
  httpResponseSize,
  itemsProcessed,
  register,
  version,
}
