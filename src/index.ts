import app, { setReady } from "./app.js"

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`app started on port ${PORT}...`)
})

const DRAIN_MS = Number(process.env.SHUTDOWN_DRAIN_MS || 5000)

const shutdown = () => {
  console.log(`shutting down (draining for ${DRAIN_MS}ms)...`)
  setReady(false)
  server.close(() => {
    console.log("all connections drained, exiting")
    process.exit(0)
  })
  setTimeout(() => {
    console.log("drain timeout reached, forcing exit")
    process.exit(0)
  }, DRAIN_MS).unref()
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
