import express from 'express'

import authMiddleware from './middleware/auth'

import * as auth from './routes/auth'
import * as client from './routes/client'
import * as tunnel from './routes/tunnel'

import {
  checkForRathole,
  generateAndSaveRatholeServerConfig,
  runRathole,
} from './misc/bin'
import { loadPorts } from './misc/ports'

const ratholeInstalled = await checkForRathole()

if (!ratholeInstalled) {
  throw new Error('Rathole not installed')
}

loadPorts()

generateAndSaveRatholeServerConfig()

runRathole()

const app = express()
app.use(express.json())

app.post('/api/v1/auth/login', auth.login)
app.get('/api/v1/auth/me', authMiddleware, auth.me)

app.get('/api/v1/client', authMiddleware, client.list)
app.post('/api/v1/client', authMiddleware, client.create)
app.delete('/api/v1/client/:id', authMiddleware, client.remove)

app.get('/api/v1/tunnel', authMiddleware, tunnel.list)
app.post('/api/v1/tunnel', authMiddleware, tunnel.create)
app.delete('/api/v1/tunnel/:id', authMiddleware, tunnel.remove)

app.listen(3001, () => {
  console.log(`Server listening at http://localhost:3001`)
})
