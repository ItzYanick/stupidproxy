import { Database, Statement } from 'bun:sqlite'

let dbClient: Database

const createQuery = (db: Database): Statement => {
  dbClient = db
  return db.query(`
    CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner INTEGER NOT NULL,
        name TEXT NOT NULL
    )
    `)
}

export default createQuery

export const create = (owner: number, name: string): void => {
  const query = dbClient.query(`
            INSERT INTO clients (owner, name) VALUES ($owner, $name)
        `)
  return query.run({
    $owner: owner,
    $name: name,
  })
}

export const find = (id: number): Client | null => {
  const query = dbClient.query(
    'SELECT id, owner, name FROM clients WHERE id = $id'
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = query.get({
    $id: id,
  })

  if (result) {
    return {
      id: result.id,
      owner: result.owner,
      name: result.name,
    }
  }

  return null
}

export const findByOwner = (owner: number): Client[] => {
  const query = dbClient.query(
    'SELECT id, owner, name FROM clients WHERE owner = $owner'
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = query.all({
    $owner: owner,
  })

  return result.map((client) => ({
    id: client.id,
    owner: client.owner,
    name: client.name,
  }))
}
