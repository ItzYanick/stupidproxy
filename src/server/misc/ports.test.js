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
    const availablePorts = ports.filter(isPortAvailable)
    expect(availablePorts.length).toBe(ports.length)

    addPort(ports[0])
    expect(isPortAvailable(ports[0])).toBe(false)
    const availablePorts2 = ports.filter(isPortAvailable)
    expect(availablePorts2.length).toBeGreaterThanOrEqual(0)
    expect(availablePorts2.length).toBeLessThan(ports.length)

    if (isPortAvailable(ports[1])) {
      addPort(ports[1])
    }
    expect(isPortAvailable(ports[1])).toBe(false)

    if (isPortAvailable(ports[2])) {
      addPort(ports[2])
    }
    expect(isPortAvailable(ports[2])).toBe(false)

    const freePort = findFreePort()
    expect(freePort).toBeWithin(startPort, endPort)
    expect(isPortAvailable(freePort)).toBe(true)
    addPort(freePort)
    expect(isPortAvailable(freePort)).toBe(false)

    removePort(freePort)
    expect(isPortAvailable(freePort)).toBe(true)

    expect(isPortAvailable(ports[0])).toBe(false)
    removePort(ports[0])
    expect(isPortAvailable(ports[0])).toBe(true)

    removePort(ports[1])
    expect(isPortAvailable(ports[1])).toBe(true)

    const freePort2 = findFreePort()
    expect(freePort2).toBeWithin(startPort, endPort)
    expect(isPortAvailable(freePort2)).toBe(true)
    addPort(freePort2)
    expect(isPortAvailable(freePort2)).toBe(false)
  })
})
