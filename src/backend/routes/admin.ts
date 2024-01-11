import { Request, Response } from 'express'

import db from '../db'

export const createAccount = (req: Request, res: Response) => {
  const { username, password } = req.body
  const user = db.users.find(username)
  if (user) {
    res.status(400).json({ message: 'Username already exists' })
  } else {
    db.users.create(username, password)
    res.json({ message: 'Account created' })
  }
}
