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
          res.json({
            token: jwt.sign(
              {
                iat: currentTime,
                exp: currentTime + 60 * 60 * 24 * 7, // 1 week
                sub: user.id,
                usr: user.username,
                adm: user.isAdmin ? 1 : 0,
              } satisfies jwtPayload,
              process.env.JWT_SECRET as string
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

export const token_create = (req: Request, res: Response) => {
  const { client } = req.body
  const user = req.user

  const client_o = db.clients.find(client)
  if (client_o) {
    const sec = db.tokens.create(user.sub, client_o.id)
    res.json({ message: 'Token created', secret: sec })
  } else {
    res.status(400).json({ message: 'Invalid client' })
  }
}

export const token_list = (req: Request, res: Response) => {
  const user = req.user
  const tokens = db.tokens.findByOwner(user.sub)
  res.json({ tokens: tokens })
}

export const token_delete = (req: Request, res: Response) => {
  const user = req.user
  const { secret } = req.params
  const tokens = db.tokens.findByOwner(user.sub)
  const token = tokens.find((t) => t.secret === secret)
  if (token) {
    db.tokens.remove(token.secret)
    res.json({ message: 'Token deleted' })
  } else {
    res.status(400).json({ message: 'Invalid token' })
  }
}

export const changePassword = (req: Request, res: Response) => {
  const user = req.user
  const dbUser = db.users.find(user.usr)
  const { oldPassword, newPassword } = req.body
  Bun.password
    .verify(oldPassword, dbUser!.password)
    .then((valid) => {
      if (valid) {
        db.users.updatePassword(user.usr, newPassword)
        res.json({ message: 'Password changed' })
      } else {
        res.status(401).json({ message: 'Invalid password' })
      }
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json({ message: 'Internal server error' })
    })
}

export const me = (req: Request, res: Response) => {
  res.json(req.user)
}
