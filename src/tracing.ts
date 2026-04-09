import { NodeSDK } from "@opentelemetry/sdk-node"
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions"
import { resourceFromAttributes } from "@opentelemetry/resources"

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "node-with-metrics",
  }),
  traceExporter: new OTLPTraceExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      "http://localhost:4318/v1/traces",
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": { enabled: false },
    }),
  ],
})

sdk.start()

process.on("SIGTERM", () => {
  sdk.shutdown().then(
    () => console.log("OTel SDK shut down"),
    (err) => console.error("OTel SDK shutdown error", err),
  )
})
