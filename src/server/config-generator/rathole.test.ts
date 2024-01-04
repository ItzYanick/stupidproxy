import { expect, test, describe } from 'bun:test'

import { generateServerConfig } from './rathole'

const expectedStart = `[server]
bind_addr = "0.0.0.0:${process.env.RATHOLE_PORT}"

`

describe('example configs', () => {
  test('generate a example config', () => {
    const tunnels: Tunnel[] = [
      {
        id: -1,
        owner: -1,
        name: 'my_nas_ssh',
        description: 'SSH to my NAS',
        type: 'tcp',
        port: 5202,
        hostname: '',
        secret: 'use_a_secret_that_only_you_know',
      },
    ]

    const expected = `${expectedStart}[server.services.my_nas_ssh]
token = "use_a_secret_that_only_you_know"
bind_addr = "0.0.0.0:5202"`

    const actual = generateServerConfig(tunnels)

    expect(actual).toEqual(expected)
  })

  test('generate a example config with http', () => {
    const tunnels: Tunnel[] = [
      {
        id: -1,
        owner: -1,
        name: 'my_nas_http',
        description: 'HTTP to my NAS',
        type: 'http',
        port: 5202,
        hostname: '',
        secret: 'other secret',
      },
    ]

    const expected = `${expectedStart}[server.services.my_nas_http]
token = "other secret"
bind_addr = "127.0.0.80:5202"`

    const actual = generateServerConfig(tunnels)

    expect(actual).toEqual(expected)
  })

  test('generate a example config with https', () => {
    const tunnels: Tunnel[] = [
      {
        id: -1,
        owner: -1,
        name: 'my_nas_https',
        description: 'HTTPS to my NAS',
        type: 'https',
        port: 5202,
        hostname: '',
        secret: 'other secret',
      },
    ]

    const expected = `${expectedStart}[server.services.my_nas_https]
token = "other secret"
bind_addr = "127.0.0.80:5202"`

    const actual = generateServerConfig(tunnels)

    expect(actual).toEqual(expected)
  })
})

describe('real configs', () => {
  test('generate a real config', () => {
    const tunnels: Tunnel[] = [
      {
        id: 1,
        owner: 1,
        name: 'tcp_WL7Aza_1',
        description: 'SSH to my NAS',
        type: 'tcp',
        port: 58515,
        hostname: '',
        secret: 'DnbauytSmV3N48YM9UfTKZ',
      },
      {
        id: 2,
        owner: 1,
        name: 'tcp_nYUh6g_2',
        description: 'SSH to my NAS',
        type: 'tcp',
        port: 25037,
        hostname: '',
        secret: 'LW4eY7kZqX7J4j6v3Ckz8n',
      },
      {
        id: 3,
        owner: 1,
        name: 'http_F6cukY_3',
        description: 'HTTP to my NAS',
        type: 'http',
        port: 46312,
        hostname: 'sub.example.org',
        secret: '9jX6k5h9W3xW9Dp3b3y2s7',
      },
    ]

    const expected = `${expectedStart}[server.services.tcp_WL7Aza_1]
token = "DnbauytSmV3N48YM9UfTKZ"
bind_addr = "0.0.0.0:58515"

[server.services.tcp_nYUh6g_2]
token = "LW4eY7kZqX7J4j6v3Ckz8n"
bind_addr = "0.0.0.0:25037"

[server.services.http_F6cukY_3]
token = "9jX6k5h9W3xW9Dp3b3y2s7"
bind_addr = "127.0.0.80:46312"`

    const actual = generateServerConfig(tunnels)

    expect(actual).toEqual(expected)
  })
})
