import { Database, Statement } from 'bun:sqlite'

let dbClient: Database

const createQuery = (db: Database): Statement => {
  dbClient = db
  return db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL
    )
  `)
}

export default createQuery

export const create = (username: string, password: string): void => {
  const query = dbClient.query(`
        INSERT INTO users (username, password) VALUES ($username, $password)
    `)
  return query.run({
    $username: username,
    $password: Bun.password.hashSync(password),
  })
}

export const find = (username: string): User | null => {
  const query = dbClient.query(
    'SELECT id, username, password FROM users WHERE username = $username'
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = query.get({
    $username: username,
  })

  if (!result) {
    return null
  }
  return {
    id: result.id,
    username: result.username,
    password: result.password,
  }
}
