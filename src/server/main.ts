import express from 'express'

import * as auth from './routes/auth'

const app = express()
app.use(express.json())

app.post('/api/v1/login', auth.login)

app.listen(3001, () => {
  console.log(`Server listening at http://localhost:3001`)
})
