import { Database, Statement } from 'bun:sqlite'
import { generateRandomString } from '../../misc/random'

let dbClient: Database

const createQuery = (db: Database): Statement => {
  dbClient = db
  return db.query(`
    CREATE TABLE IF NOT EXISTS tokens (
        secret TEXT PRIMARY KEY,
        owner INTEGER NOT NULL,
        client INTEGER NOT NULL
    )
    `)
}

export default createQuery

export const create = (owner: number, client: number): string => {
  const query = dbClient.query(`
            INSERT INTO tokens (secret, owner, client) VALUES ($secret, $owner, $client)
        `)
  const sec = generateRandomString(32)
  query.run({
    $secret: sec,
    $owner: owner,
    $client: client,
  })
  return sec
}

export const find = (secret: string): Token => {
  const query = dbClient.query(`
    SELECT * FROM tokens WHERE secret = $secret
    `)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: any = query.get({ $secret: secret })
  return {
    secret: row.secret,
    owner: row.owner,
    client: row.client,
  }
}

export const findByOwner = (owner: number): Token[] => {
  const query = dbClient.query(`
                SELECT * FROM tokens WHERE owner = $owner
            `)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return query.all({ $owner: owner }).map((row: any) => {
    return {
      secret: row.secret,
      owner: row.owner,
      client: row.client,
    }
  })
}

export const remove = (secret: string): void => {
  const query = dbClient.query(`
                DELETE FROM tokens WHERE secret = $secret
            `)
  query.run({ $secret: secret })
}
