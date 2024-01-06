import { Request, Response } from 'express'

import db from '../db'

export const list = (req: Request, res: Response) => {
  const user = req.user
  const clients = db.clients.findByOwner(user.sub)

  const clientsNoOwner = clients.map((client) => {
    return { id: client.id, name: client.name }
  })

  res.json({ clients: clientsNoOwner })
}

export const create = (req: Request, res: Response) => {
  const { name } = req.body
  const user = req.user
  db.clients.create(user.sub, name)

  res.status(201).json({ message: 'Client created' })
}

export const remove = (req: Request, res: Response) => {
  const { id } = req.params
  const parsedId = parseInt(id)
  const user = req.user
  const client = db.clients.find(parsedId)

  if (!client) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  if (client.owner !== user.sub) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  db.clients.remove(parsedId)

  res.status(200).json({ message: 'Client deleted' })
}
