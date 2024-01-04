import express from 'express'

import * as auth from './routes/auth'

import {
  checkForRathole,
  downloadRathole,
  checkLatestRelease,
  generateConfig,
  runRathole,
} from './misc/rathole'

if (!checkLatestRelease()) {
  console.log('INFO: New rathole version available')
}

const ratholeInstalled = await checkForRathole()

if (!ratholeInstalled) {
  downloadRathole()
} else {
  console.log('INFO: Rathole already installed')
}

generateConfig()

runRathole()

const app = express()
app.use(express.json())

app.post('/api/v1/login', auth.login)

app.listen(3001, () => {
  console.log(`Server listening at http://localhost:3001`)
})
