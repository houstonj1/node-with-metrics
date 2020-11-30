const app = require('./src/app')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`app started on port ${PORT}...`)
})

process.on('SIGINT', () => {
    console.log('shutting down...')
    process.exit(0)
})
