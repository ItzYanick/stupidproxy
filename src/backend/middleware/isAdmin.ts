import { Request, Response, NextFunction } from 'express'

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user
  if (user.adm) {
    next()
  } else {
    res.status(403).json({ message: 'Forbidden' })
  }
}

export default isAdmin
