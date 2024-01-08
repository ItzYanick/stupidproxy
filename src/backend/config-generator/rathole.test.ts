import { expect, test, describe } from 'bun:test'

import { generateServerConfig } from './rathole'

const expectedStart = `[server]
bind_addr = "${process.env.RATHOLE_BIND}:${process.env.RATHOLE_PORT}"

`

describe('example configs', () => {
  test('generate a example config', () => {
    const tunnels: Tunnel[] = [
      {
        id: -1,
        owner: -1,
        client: -1,
        name: 'my_nas_ssh',
        description: 'SSH to my NAS',
        type: 'tcp',
        port: 5202,
        hostname: '',
        secret: 'use_a_secret_that_only_you_know',
        target: '192.168.1.1:22',
      },
    ]

    const expected = `${expectedStart}[server.services]
[server.services.my_nas_ssh]
type = "tcp"
token = "use_a_secret_that_only_you_know"
bind_addr = "${process.env.RATHOLE_BIND}:5202"`

    const actual = generateServerConfig(tunnels)

    expect(actual).toEqual(expected)
  })

  test('generate a example config with http', () => {
    const tunnels: Tunnel[] = [
      {
        id: -1,
        owner: -1,
        client: -1,
        name: 'my_nas_http',
        description: 'HTTP to my NAS',
        type: 'http',
        port: 5202,
        hostname: '',
        secret: 'other secret',
        target: '192.168.1.1:80',
      },
    ]

    const expected = `${expectedStart}[server.services]
[server.services.my_nas_http]
type = "tcp"
token = "other secret"
bind_addr = "${process.env.RATHOLE_BIND_HTTP}:5202"`

    const actual = generateServerConfig(tunnels)

    expect(actual).toEqual(expected)
  })

  test('generate a example config with https', () => {
    const tunnels: Tunnel[] = [
      {
        id: -1,
        owner: -1,
        client: -1,
        name: 'my_nas_https',
        description: 'HTTPS to my NAS',
        type: 'https',
        port: 5202,
        hostname: '',
        secret: 'other secret',
        target: '192.168.1.1:443',
      },
    ]

    const expected = `${expectedStart}[server.services]
[server.services.my_nas_https]
type = "tcp"
token = "other secret"
bind_addr = "${process.env.RATHOLE_BIND_HTTP}:5202"`

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
        client: 1,
        name: 'tcp_WL7Aza_1',
        description: 'SSH to my NAS',
        type: 'tcp',
        port: 58515,
        hostname: '',
        secret: 'DnbauytSmV3N48YM9UfTKZ',
        target: '192.168.1.1:22',
      },
      {
        id: 2,
        owner: 1,
        client: 1,
        name: 'udp_nYUh6g_2',
        description: 'UDP to my NAS',
        type: 'udp',
        port: 25037,
        hostname: '',
        secret: 'LW4eY7kZqX7J4j6v3Ckz8n',
        target: '192.168.1.1:22',
      },
      {
        id: 3,
        owner: 1,
        client: 1,
        name: 'http_F6cukY_3',
        description: 'HTTP to my NAS',
        type: 'http',
        port: 46312,
        hostname: 'sub.example.org',
        secret: '9jX6k5h9W3xW9Dp3b3y2s7',
        target: '192.168.1.1:22',
      },
    ]

    const expected = `${expectedStart}[server.services]
[server.services.tcp_WL7Aza_1]
type = "tcp"
token = "DnbauytSmV3N48YM9UfTKZ"
bind_addr = "${process.env.RATHOLE_BIND}:58515"

[server.services.udp_nYUh6g_2]
type = "udp"
token = "LW4eY7kZqX7J4j6v3Ckz8n"
bind_addr = "${process.env.RATHOLE_BIND}:25037"

[server.services.http_F6cukY_3]
type = "tcp"
token = "9jX6k5h9W3xW9Dp3b3y2s7"
bind_addr = "${process.env.RATHOLE_BIND_HTTP}:46312"`

    const actual = generateServerConfig(tunnels)

    expect(actual).toEqual(expected)
  })
})
