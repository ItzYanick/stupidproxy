import { stringify } from 'smol-toml'

export const generateServerConfig = (tunnels: Tunnel[]): string => {
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

  const out = stringify(config)
  return removeUnwantedSideEffects(out)
}

const removeUnwantedSideEffects = (config: string): string => {
  // remove [server.services]\n
  config = config.replace(/\[server.services\]\n/, '')
  return config
}
