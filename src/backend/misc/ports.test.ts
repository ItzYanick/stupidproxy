import { expect, test, describe } from 'bun:test'

import {
  generatePort,
  isPortAvailable,
  addPort,
  startPort,
  endPort,
  findFreePort,
  removePort,
} from './ports'
import { TunnelType } from '../enums'

describe('generating ports', () => {
  test('generates a port', () => {
    const port = generatePort()
    expect(port).toBeWithin(startPort, endPort)
  })

  test('generate 10 ports', () => {
    const ports = Array.from({ length: 10 }, generatePort)
    expect(ports.length).toEqual(10)
    expect(ports.every((port) => port >= startPort && port <= endPort)).toBe(
      true
    )
  })

  test('generate 1000 ports', () => {
    const ports = Array.from({ length: 1000 }, generatePort)
    expect(ports.length).toEqual(1000)
    expect(ports.every((port) => port >= startPort && port <= endPort)).toBe(
      true
    )
  })

  test('generate 100000 ports', () => {
    const ports = Array.from({ length: 100000 }, generatePort)
    expect(ports.length).toEqual(100000)
    expect(ports.every((port) => port >= startPort && port <= endPort)).toBe(
      true
    )
  })
})

describe('checking ports', () => {
  test('big port list test suite', () => {
    const ports = Array.from({ length: 100000 }, generatePort)
    const availablePorts = ports.filter((port) =>
      isPortAvailable(TunnelType.tcp, port)
    )
    expect(availablePorts.length).toBe(ports.length)

    addPort(TunnelType.tcp, ports[0])
    expect(isPortAvailable(TunnelType.tcp, ports[0])).toBe(false)
    const availablePorts2 = ports.filter((port) =>
      isPortAvailable(TunnelType.tcp, port)
    )
    expect(availablePorts2.length).toBeGreaterThanOrEqual(0)
    expect(availablePorts2.length).toBeLessThan(ports.length)

    if (isPortAvailable(TunnelType.tcp, ports[1])) {
      addPort(TunnelType.tcp, ports[1])
    }
    expect(isPortAvailable(TunnelType.tcp, ports[1])).toBe(false)

    if (isPortAvailable(TunnelType.tcp, ports[2])) {
      addPort(TunnelType.tcp, ports[2])
    }
    expect(isPortAvailable(TunnelType.tcp, ports[2])).toBe(false)

    const freePort = findFreePort(TunnelType.tcp)
    expect(freePort).toBeWithin(startPort, endPort)
    expect(isPortAvailable(TunnelType.tcp, freePort)).toBe(true)
    addPort(TunnelType.tcp, freePort)
    expect(isPortAvailable(TunnelType.tcp, freePort)).toBe(false)

    removePort(TunnelType.tcp, freePort)
    expect(isPortAvailable(TunnelType.tcp, freePort)).toBe(true)

    expect(isPortAvailable(TunnelType.tcp, ports[0])).toBe(false)
    removePort(TunnelType.tcp, ports[0])
    expect(isPortAvailable(TunnelType.tcp, ports[0])).toBe(true)

    removePort(TunnelType.tcp, ports[1])
    expect(isPortAvailable(TunnelType.tcp, ports[1])).toBe(true)

    const freePort2 = findFreePort(TunnelType.tcp)
    expect(freePort2).toBeWithin(startPort, endPort)
    expect(isPortAvailable(TunnelType.tcp, freePort2)).toBe(true)
    addPort(TunnelType.tcp, freePort2)
    expect(isPortAvailable(TunnelType.tcp, freePort2)).toBe(false)
  })
})
