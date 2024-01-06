import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const auth = (req: Request, res: Response, next: NextFunction) => {
  const bearerHeader = req.headers['authorization']
  if (typeof bearerHeader === 'undefined') {
    return res.status(403).json({ message: 'Forbidden' })
  }
  const bearer = bearerHeader.split(' ')
  if (bearer.length !== 2) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  if (bearer[0] !== 'Bearer') {
    return res.status(403).json({ message: 'Forbidden' })
  }
  const token = bearer[1]
  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' })
    }
    req.user = decoded
    next()
  })
}

export default auth
