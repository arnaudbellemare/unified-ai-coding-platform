import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { getEnvironmentConfig } from '@/lib/config/env'

// Make database optional for development and deployments without database
let client: postgres.Sql | null = null
let db: ReturnType<typeof drizzle> | null = null

// Initialize database connection based on environment configuration
function initializeDatabase() {
  const config = getEnvironmentConfig()

  // Skip database connection during build time or if no POSTGRES_URL
  if (config.isBuildTime || !config.hasDatabase) {
    if (config.isBuildTime) {
      console.log('[Database] Build time detected, database connection skipped')
    } else {
      console.warn('[Database] POSTGRES_URL not provided, database features disabled')
    }
    return
  }

  try {
    client = postgres(process.env.POSTGRES_URL!)
    db = drizzle(client, { schema })
    console.log('[Database] Connected to PostgreSQL')
  } catch (error) {
    console.warn('[Database] Failed to connect to PostgreSQL:', error)
  }
}

// Initialize on import
initializeDatabase()

export { db }
