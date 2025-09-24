import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Make database optional for development
let client: postgres.Sql | null = null
let db: ReturnType<typeof drizzle> | null = null

if (process.env.POSTGRES_URL) {
  try {
    client = postgres(process.env.POSTGRES_URL)
    db = drizzle(client, { schema })
    console.log('[Database] Connected to PostgreSQL')
  } catch (error) {
    console.warn('[Database] Failed to connect to PostgreSQL:', error)
  }
} else {
  console.warn('[Database] POSTGRES_URL not provided, database features disabled')
}

export { db }
