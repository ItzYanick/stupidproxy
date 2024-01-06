import express from 'express'

import authMiddleware from './middleware/auth'

import * as auth from './routes/auth'

import { checkForRathole, generateConfigs, runRathole } from './misc/bin'

const ratholeInstalled = await checkForRathole()

if (!ratholeInstalled) {
  throw new Error('Rathole not installed')
}

generateConfigs()

runRathole()

const app = express()
app.use(express.json())

app.post('/api/v1/auth/login', auth.login)
app.get('/api/v1/auth/me', authMiddleware, auth.me)

app.listen(3001, () => {
  console.log(`Server listening at http://localhost:3001`)
})
