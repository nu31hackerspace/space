import { Pool } from 'pg'

export interface Queryable {
    query: (sql: string, values?: unknown[]) => Promise<unknown>
}

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

export async function connectDatabase(connectionString: string): Promise<Pool> {
    console.info('Connecting to PostgreSQL...')
    const pool = new Pool({ connectionString })
    pool.on('error', (error) => {
        console.error('PostgreSQL pool error:', error)
    })
    await pool.query(SCHEMA_SQL)
    console.info('Connected to PostgreSQL')
    return pool
}

export async function pingDatabase(
    db: Queryable | undefined
): Promise<boolean> {
    if (!db) {
        return false
    }

    try {
        await db.query('SELECT 1')
        return true
    } catch {
        return false
    }
}
