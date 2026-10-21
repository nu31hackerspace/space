import { Client, Pool, escapeIdentifier } from 'pg'
import { defineNitroPlugin, useRuntimeConfig } from '#imports'

// No migrations: the database and tables are created on boot if missing.
const SCHEMA_SQL = `
    CREATE TABLE IF NOT EXISTS tracking (
        id          BIGSERIAL   PRIMARY KEY,
        action      TEXT        NOT NULL,
        country     TEXT,
        data        JSONB       NOT NULL DEFAULT '{}',
        session_key TEXT,
        timestamp   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
`

export default defineNitroPlugin(async (nitroApp) => {
    // useRuntimeConfig must be called inside the plugin callback — it is not available at module level.
    const url = useRuntimeConfig().postgresUrl

    nitroApp.logger.info('Connecting to PostgreSQL...')
    try {
        await ensureDatabase(url)

        const pool = new Pool({ connectionString: url })
        pool.on('error', (error) => {
            nitroApp.logger.error('PostgreSQL pool error:', error)
        })
        await pool.query(SCHEMA_SQL)

        nitroApp.db = pool
        nitroApp.logger.info('Connected to PostgreSQL')
    } catch (error) {
        nitroApp.logger.error('Failed to connect to PostgreSQL:', error)
    }

    nitroApp.hooks.hook('close', async () => {
        await nitroApp.db?.end()
    })
})

// CREATE DATABASE can't run inside the target database, so connect to the
// default `postgres` one first, with the same server and credentials.
async function ensureDatabase(url: string) {
    const serverUrl = new URL(url)
    const database = decodeURIComponent(serverUrl.pathname.slice(1))
    serverUrl.pathname = '/postgres'

    const client = new Client({ connectionString: serverUrl.toString() })
    await client.connect()
    try {
        const { rowCount } = await client.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [database]
        )
        if (!rowCount) {
            await client.query(`CREATE DATABASE ${escapeIdentifier(database)}`)
        }
    } finally {
        await client.end()
    }
}

declare module 'nitropack' {
    interface NitroApp {
        db?: Pool
    }
}
