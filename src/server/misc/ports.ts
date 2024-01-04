export const startPort = 1024
export const endPort = 65535

const portList: number[] = []
const commonPorts: number[] = [parseInt(process.env.RATHOLE_PORT!, 10)]

export const generatePort = (): number => {
  const buf = new Uint8Array(1)
  crypto.getRandomValues(buf)
  const random = buf[0] / 255
  const range = endPort - startPort
  const port = startPort + Math.round(random * range)
  return port
}

export const isPortAvailable = (port: number) => {
  return portList.indexOf(port) === -1 && commonPorts.indexOf(port) === -1
}

export const addPort = (port: number) => {
  if (isPortAvailable(port)) {
    portList.push(port)
  }
}

export const findFreePort = (): number => {
  let port = generatePort()
  while (!isPortAvailable(port)) {
    port = generatePort()
  }
  return port
}

export const removePort = (port: number) => {
  const index = portList.indexOf(port)
  if (index > -1) {
    portList.splice(index, 1)
  }
}
