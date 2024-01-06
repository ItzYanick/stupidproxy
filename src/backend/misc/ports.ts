import db from '../db'

import { TunnelType } from '../enums'

export const startPort = 1024
export const endPort = 65535

const portList: {
  [key: string]: number[]
} = {
  http: [],
  tcp: [],
  udp: [],
}
const commonPorts: number[] = [parseInt(process.env.RATHOLE_PORT!, 10)]

export const generatePort = (): number => {
  const buf = new Uint8Array(1)
  crypto.getRandomValues(buf)
  const random = buf[0] / 255
  const range = endPort - startPort
  const port = startPort + Math.round(random * range)
  return port
}

export const isPortAvailable = (type: TunnelType, port: number) => {
  const vtype: TunnelType = type === 'https' ? TunnelType.http : type
  return (
    portList[vtype].indexOf(port) === -1 && commonPorts.indexOf(port) === -1
  )
}

export const addPort = (type: TunnelType, port: number) => {
  if (isPortAvailable(type, port)) {
    const vtype: TunnelType = type === 'https' ? TunnelType.http : type
    portList[vtype].push(port)
  }
}

export const findFreePort = (type: TunnelType): number => {
  let port = generatePort()
  while (!isPortAvailable(type, port)) {
    port = generatePort()
  }
  return port
}

export const removePort = (type: TunnelType, port: number) => {
  const vtype: TunnelType = type === 'https' ? TunnelType.http : type
  const index = portList[vtype].indexOf(port)
  if (index > -1) {
    portList[vtype].splice(index, 1)
  }
}

export const loadPorts = () => {
  const tunnels = db.tunnels.findAll()
  tunnels.forEach((tunnel) => {
    addPort(tunnel.type, tunnel.port)
  })
  console.log('Loaded ports')
  console.table(portList)
}
