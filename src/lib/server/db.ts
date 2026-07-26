import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let client: postgres.Sql | null = null
let db: ReturnType<typeof drizzle> | null = null

export function getDb() {
	if (!client || !db) {
		if (!import.meta.env.DATABASE_URL) {
			throw new Error('DATABASE_URL environment variable is not set')
		}

		client = postgres(import.meta.env.DATABASE_URL)
		db = drizzle(client, { schema })
	}

	return db
}

export function closeDb() {
	if (client) {
		client.end()
		client = null
		db = null
	}
}
