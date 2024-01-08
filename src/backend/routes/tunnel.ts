import { Request, Response } from 'express'

import db from '../db'
import { TunnelType } from '../enums'
import { addPort, findFreePort } from '../misc/ports'
import { generateRandomString } from '../misc/random'
import { generateAndSaveRatholeServerConfig } from '../misc/bin'

export const list = (req: Request, res: Response) => {
  const user = req.user
  const tunnels = db.tunnels.findAllByOwner(user.sub)

  const vTunnels = tunnels.map((tunnel) => {
    return {
      id: tunnel.id,
      client: tunnel.client,
      description: tunnel.description,
      type: tunnel.type,
      port: tunnel.port,
      hostname: tunnel.hostname,
      target: tunnel.target,
    }
  })
  res.json({ tunnels: vTunnels })
}

export const create = (req: Request, res: Response) => {
  const { description, client, type, hostname, target } = req.body
  const user = req.user
  const client_o = db.clients.find(client)

  const vtype = type as TunnelType

  if (!client_o) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  if (client_o.owner !== user.sub) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  const port = findFreePort(vtype)

  const name = type + '_' + port

  addPort(vtype, port)

  const secret = generateRandomString(32)

  db.tunnels.create(
    user.sub,
    client_o.id,
    name,
    description,
    type,
    port,
    hostname,
    secret,
    target
  )

  res.status(201).json({ message: 'Tunnel created' })

  generateAndSaveRatholeServerConfig()
}

export const remove = (req: Request, res: Response) => {
  const { id } = req.params
  const parsedId = parseInt(id)
  const user = req.user
  const tunnel = db.tunnels.find(parsedId)

  if (!tunnel) {
    console.log('Tunnel not found')
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  if (tunnel.owner !== user.sub) {
    console.log('Tunnel not owned by user')
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  db.tunnels.remove(parsedId)

  res.status(200).json({ message: 'Tunnel deleted' })

  generateAndSaveRatholeServerConfig()
}
