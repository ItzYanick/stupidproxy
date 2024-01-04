declare type User = {
  id: number
  username: string
  password: string
  isAdmin: boolean
}

declare type Tunnel = {
  id: number
  owner: number
  name: string
  description: string
  type: string
  port: number
  hostname: string
  secret: string
}
