import { stringify } from 'smol-toml'

import db from '../db'

export const generateServerConfig = (): string => {
  const tunnels = db.tunnels.findAll()

  const config = {
    server: {
      bind_addr: `0.0.0.0:${process.env.RATHOLE_PORT}`,
      services: null,
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const services: any = {}

  tunnels.forEach((tunnel) => {
    const isHTTP = tunnel.type === 'http' || tunnel.type === 'https'
    let bindIP = `0.0.0.0`
    if (isHTTP) {
      bindIP = `127.0.0.80`
    }

    services[tunnel.name] = {
      token: tunnel.secret,
      bind_addr: `${bindIP}:${tunnel.port}`,
    }
  })

  config.server.services = services

  return stringify(config)
}

export const generateClientConfig = (client: number): string => {
  const tunnel = db.tunnels.findAllByClient(client)

  const config = {
    client: {
      remote_addr: `${process.env.PUBLIC_HOST}:${process.env.RATHOLE_PORT}`,
      services: null,
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const services: any = {}

  tunnel.forEach((tunnel) => {
    services[tunnel.name] = {
      token: tunnel.secret,
      local_addr: `${tunnel.target}`,
    }
  })

  config.client.services = services

  return stringify(config)
}
