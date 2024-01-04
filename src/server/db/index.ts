import { Database } from 'bun:sqlite'

import * as users from './schema/users'
import * as tunnels from './schema/tunnels'

const db = new Database('db.sqlite')

let query = db.query("select 'OK' as message;")
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const result: any = query.get()
console.log('Running db test: ' + result.message)

// create table if not exists
query = users.default(db)
query.run()

query = tunnels.default(db)
query.run()

// create default user if not exists
const user = users.find('admin')
if (!user) {
  users.create('admin', 'admin', true)
}

export default { databaseClient: db, users, tunnels }
