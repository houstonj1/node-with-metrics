# Node with Metrics

A minimal Node.js + Express service demonstrating production-ready Prometheus metrics alongside OpenTelemetry distributed tracing, with exemplars bridging the two.

## Quick start

```bash
nvm install $(cat .nvmrc)
corepack enable
yarn install
yarn dev
```

## What's instrumented

**Prometheus metrics** (via prom-client, hand-crafted):

- `http_request_duration_seconds` — histogram with trace ID exemplars
- `http_requests_total` — counter by method, route, status code
- `http_requests_in_flight` — gauge
- `http_response_size_bytes` — histogram
- `items_processed_total` — business metric with status labels
- `app_info` / `app_start_timestamp_seconds` — metadata gauges
- Default Node.js runtime metrics (GC, event loop, memory, etc.)

**OpenTelemetry traces** (auto-instrumented):

- Express route handling
- HTTP client/server spans
- Trace context propagation across services

**Exemplars** link the two: each histogram observation carries the OTel trace ID, so you can click from a Prometheus latency spike directly into the Jaeger trace that caused it.

**Grafana dashboards**:

- [HTTP Metrics](http://localhost:3001/d/http-metrics/http-metrics?orgId=1&from=now-15m&to=now&timezone=browser&refresh=5s)
- [Node.js Runtime](http://localhost:3001/d/nodejs-runtime/nodejs-application-dashboard?orgId=1&from=now-5m&to=now&timezone=browser&var-instance=$__all&refresh=5s)

## Full observability stack

```bash
docker compose up
```

| Service    | URL                    |
| ---------- | ---------------------- |
| App        | http://localhost:3000  |
| Prometheus | http://localhost:9090  |
| Jaeger     | http://localhost:16686 |
| Grafana    | http://localhost:3001  |

Grafana is setup to provision the Prometheus and Jaeger datasources. Exemplar linking is configured — query a histogram in Grafana and click the trace ID to jump to Jaeger.

## Endpoints

| Method | Path       | Purpose                                  |
| ------ | ---------- | ---------------------------------------- |
| GET    | `/`        | Health check                             |
| GET    | `/version` | Package version                          |
| GET    | `/metrics` | OpenMetrics/Prometheus                   |
| GET    | `/healthz` | Kubernetes liveness probe                |
| GET    | `/readyz`  | Kubernetes readiness probe               |
| POST   | `/items`   | Simulated async work                     |
| GET    | `/error`   | Always returns 500 (for dashboard demos) |

`/metrics`, `/healthz`, and `/readyz` are excluded from metrics recording.

## Development

```bash
yarn install      # Install dependencies
yarn dev          # Dev server with tracing + hot reload
yarn build        # Compile TypeScript
yarn test         # Run tests
yarn lint         # ESLint + Prettier
```
