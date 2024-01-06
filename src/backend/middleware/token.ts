import { Request, Response, NextFunction } from 'express'

import db from '../db'

const token = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers['x-token']
  if (typeof header === 'undefined') {
    return res.status(403).json({ message: 'Forbidden' })
  }
  const client = db.tokens.find(header as string)
  if (client) {
    req.user = client
    next()
  } else {
    return res.status(403).json({ message: 'Forbidden' })
  }
}

export default token
