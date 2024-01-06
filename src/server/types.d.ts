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

declare type jwtPayload = {
  iat: number
  exp: number
  sub: number
  usr: string
  adm: number
}

declare namespace Express {
  export interface Request {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any
  }
  export interface Response {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any
  }
}
