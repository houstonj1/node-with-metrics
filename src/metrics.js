const client = require('prom-client')

const register = new client.Registry()
const labels = { application: 'node-with-metrics' }

client.collectDefaultMetrics({ labels, register })

module.exports = register
