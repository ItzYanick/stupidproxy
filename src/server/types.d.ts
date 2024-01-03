declare type User = {
  id: number
  username: string
  password: string
}

declare type Tunnel = {
  id: number
  owner: number
  name: string
  type: string
  port: number
  hostname: string
  secret: string
}
