import { Database, Statement } from 'bun:sqlite'

let dbClient: Database

const createQuery = (db: Database): Statement => {
  dbClient = db
  return db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0
    )
  `)
}

export default createQuery

export const create = (
  username: string,
  password: string,
  isAdmin: boolean = false
): void => {
  const query = dbClient.query(`
        INSERT INTO users (username, password, is_admin) VALUES ($username, $password, $isAdmin)
    `)
  return query.run({
    $username: username,
    $password: Bun.password.hashSync(password),
    $isAdmin: isAdmin ? 1 : 0,
  })
}

export const find = (username: string): User | null => {
  const query = dbClient.query(
    'SELECT id, username, password, is_admin FROM users WHERE username = $username'
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
    isAdmin: result.is_admin === 1,
  }
}
