const client = require("prom-client")

const register = new client.Registry()
const labels = { application: "node-with-metrics" }

client.collectDefaultMetrics({ labels, register })

const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in microseconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
})

register.registerMetric(httpRequestDurationMicroseconds)

module.exports = {
  httpRequestDurationMicroseconds,
  register,
}
