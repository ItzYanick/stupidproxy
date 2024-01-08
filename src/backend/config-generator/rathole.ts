import { stringify } from 'smol-toml'

import db from '../db'

export const generateServerConfig = (tunnels: Tunnel[]): string => {
  const config = {
    server: {
      bind_addr: `${process.env.RATHOLE_BIND}:${process.env.RATHOLE_PORT}`,
      services: null,
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const services: any = {}

  tunnels.forEach((tunnel) => {
    const isHTTP = tunnel.type === 'http' || tunnel.type === 'https'
    let bindIP = process.env.RATHOLE_BIND
    if (isHTTP) {
      bindIP = process.env.RATHOLE_BIND_HTTP
    }

    services[tunnel.name] = {
      type: isHTTP ? 'tcp' : tunnel.type,
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
    const isHTTP = tunnel.type === 'http' || tunnel.type === 'https'
    services[tunnel.name] = {
      type: isHTTP ? 'tcp' : tunnel.type,
      token: tunnel.secret,
      local_addr: `${tunnel.target}`,
    }
  })

  config.client.services = services

  return stringify(config)
}
