import { Database } from 'bun:sqlite'

import * as users from './schema/users'
import * as clients from './schema/clients'
import * as tunnels from './schema/tunnels'
import * as tokens from './schema/tokens'

const db = new Database('_db/db.sqlite')

let query = db.query("select 'OK' as message;")
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const result: any = query.get()
console.log('Running db test: ' + result.message)

// create table if not exists
query = users.default(db)
query.run()

query = clients.default(db)
query.run()

query = tunnels.default(db)
query.run()

query = tokens.default(db)
query.run()

// create default user if not exists
const user = users.find('admin')
if (!user) {
  users.create('admin', 'admin', true)
}

export default { databaseClient: db, users, tunnels, clients, tokens }
