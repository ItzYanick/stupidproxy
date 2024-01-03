import { Database, Statement } from 'bun:sqlite'

let dbClient: Database

const createQuery = (db: Database): Statement => {
  dbClient = db
  return db.query(`
  CREATE TABLE IF NOT EXISTS tunnels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      port INTEGER NOT NULL,
      hostname TEXT NOT NULL,
      secret TEXT NOT NULL,
      FOREIGN KEY(owner) REFERENCES users(id)
  )
  `)
}

export default createQuery

export const create = (
  owner: number,
  name: string,
  type: string,
  port: number,
  hostname: string,
  secret: string
): void => {
  const query = dbClient.query(`
            INSERT INTO tunnels (owner, name, type, port, hostname, secret) VALUES ($owner, $name, $type, $port, $hostname, $secret)
        `)
  return query.run({
    $owner: owner,
    $name: name,
    $type: type,
    $port: port,
    $hostname: hostname,
    $secret: secret,
  })
}

export const find = (id: number): Tunnel | null => {
  const query = dbClient.query(
    'SELECT id, owner, name, type, port, hostname, secret FROM tunnels WHERE id = $id'
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = query.get({
    $id: id,
  })

  if (!result) {
    return null
  }
  return {
    id: result.id,
    owner: result.owner,
    name: result.name,
    type: result.type,
    port: result.port,
    hostname: result.hostname,
    secret: result.secret,
  }
}

export const findAll = (): Tunnel[] => {
  const query = dbClient.query(
    'SELECT id, owner, name, type, port, hostname, secret FROM tunnels'
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = query.all()

  return result.map((tunnel) => ({
    id: tunnel.id,
    owner: tunnel.owner,
    name: tunnel.name,
    type: tunnel.type,
    port: tunnel.port,
    hostname: tunnel.hostname,
    secret: tunnel.secret,
  }))
}
