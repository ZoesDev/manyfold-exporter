import express from 'express'
import promClient from 'prom-client'

promClient.collectDefaultMetrics()

const metricServer = express()
metricServer.get('/metrics', (req, res) => {
  console.log('metrics')
  res.send(promClient.register.metrics())
})
metricServer.get('/', (req, res) => {
    console.log('metrics homepage')
    res.send("<a href='/metrics'>/metrics</a>")
  })

metricServer.listen(9991, () =>
  console.log(`🚨 Prometheus listening on port 9991 /metrics`)
)