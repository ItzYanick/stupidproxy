import { Database, Statement } from 'bun:sqlite'

let dbClient: Database

const createQuery = (db: Database): Statement => {
  dbClient = db
  return db.query(`
  CREATE TABLE IF NOT EXISTS tunnels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner INTEGER NOT NULL,
      client INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      port INTEGER NOT NULL,
      hostname TEXT NOT NULL,
      secret TEXT NOT NULL,
      target TEXT NOT NULL,
      FOREIGN KEY(owner) REFERENCES users(id)
  )
  `)
}

export default createQuery

export const create = (
  owner: number,
  client: number,
  name: string,
  description: string,
  type: string,
  port: number,
  hostname: string,
  secret: string,
  target: string
): void => {
  const query = dbClient.query(`
            INSERT INTO tunnels (owner, client, name, description, type, port, hostname, secret, target) VALUES ($owner, $client, $name, $description, $type, $port, $hostname, $secret, $target)
        `)
  return query.run({
    $owner: owner,
    $client: client,
    $name: name,
    $description: description,
    $type: type,
    $port: port,
    $hostname: hostname,
    $secret: secret,
    $target: target,
  })
}

export const find = (id: number): Tunnel | null => {
  const query = dbClient.query(
    'SELECT id, owner, client, name, description, type, port, hostname, secret, target FROM tunnels WHERE id = $id'
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
    client: result.client,
    name: result.name,
    description: result.description,
    type: result.type,
    port: result.port,
    hostname: result.hostname,
    secret: result.secret,
    target: result.target,
  }
}

export const findAll = (): Tunnel[] => {
  const query = dbClient.query(
    'SELECT id, owner, client, name, description, type, port, hostname, secret, target FROM tunnels'
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = query.all()

  return result.map((tunnel) => ({
    id: tunnel.id,
    owner: tunnel.owner,
    client: tunnel.client,
    name: tunnel.name,
    description: tunnel.description,
    type: tunnel.type,
    port: tunnel.port,
    hostname: tunnel.hostname,
    secret: tunnel.secret,
    target: tunnel.target,
  }))
}
