import express from 'express'

import authMiddleware from './middleware/auth'
import tokenMiddleware from './middleware/token'

import * as auth from './routes/auth'
import * as client from './routes/client'
import * as tunnel from './routes/tunnel'
import * as clientOnly from './routes/clientOnly'

import {
  checkForRathole,
  generateAndSaveServerConfig,
  runCaddy,
  runRathole,
  checkForCaddy,
} from './misc/bin'
import { loadPorts } from './misc/ports'

// check if _bin is installed
const ratholeInstalled = await checkForRathole()
const caddyInstalled = await checkForCaddy()
if (!ratholeInstalled) {
  throw new Error('Rathole not installed')
}
if (!caddyInstalled) {
  throw new Error('Caddy not installed')
}

// load ports from db to var cache
loadPorts()

// generate server config
generateAndSaveServerConfig(true)

// start rathole and caddy
runRathole()
runCaddy()

// start express
const app = express()
app.use(express.json())

app.post('/api/v1/auth/login', auth.login)
app.get('/api/v1/auth/me', authMiddleware, auth.me)
app.get('/api/v1/auth/token', authMiddleware, auth.token_list)
app.post('/api/v1/auth/token', authMiddleware, auth.token_create)
app.delete('/api/v1/auth/token/:secret', authMiddleware, auth.token_delete)

app.get('/api/v1/client', authMiddleware, client.list)
app.post('/api/v1/client', authMiddleware, client.create)
app.delete('/api/v1/client/:id', authMiddleware, client.remove)

app.get('/api/v1/tunnel', authMiddleware, tunnel.list)
app.post('/api/v1/tunnel', authMiddleware, tunnel.create)
app.delete('/api/v1/tunnel/:id', authMiddleware, tunnel.remove)

app.get('/api/v1/clientOnly/generate', tokenMiddleware, clientOnly.generate)

app.use(express.static('dist'))
app.get('*', (_, res) => {
  res.sendFile('dist/index.html', { root: '.' })
})

app.listen(process.env.API_BIND, () => {
  console.log(`Server listening at https://${process.env.PUBLIC_DOMAIN}`)
})
