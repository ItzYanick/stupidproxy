import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import db from '../db'

export const login = (req: Request, res: Response) => {
  const { username, password } = req.body
  const user = db.users.find(username)
  if (user) {
    Bun.password
      .verify(password, user.password)
      .then((valid) => {
        if (valid) {
          const currentTime = Math.floor(Date.now() / 1000)
          const secret: string = process.env.JWT_SECRET || 'secret'
          res.json({
            token: jwt.sign(
              {
                sub: user.id,
                username: user.username,
                iat: currentTime,
                exp: currentTime + 60 * 60 * 24 * 7, // 1 week
              },
              secret
            ),
          })
        } else {
          res.status(401).json({ message: 'Invalid username or password' })
        }
      })
      .catch((err) => {
        console.log(err)
        res.status(500).json({ message: 'Internal server error' })
      })
  } else {
    res.status(401).json({ message: 'Invalid username or password' })
  }
}
