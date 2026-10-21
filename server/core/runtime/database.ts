import { createError } from 'h3'

// The subset of pg.Pool used here, so tests can pass a stub.
interface Queryable {
    query: (sql: string) => Promise<unknown>
}

interface NitroAppWithOptionalDb<T extends Queryable> {
    db?: T
}

export function requireDatabase<T extends Queryable>(
    nitroApp: NitroAppWithOptionalDb<T>
): T {
    if (!nitroApp.db) {
        throw createError({
            statusCode: 503,
            statusMessage: 'Database is not ready',
        })
    }

    return nitroApp.db
}

export async function pingDatabase<T extends Queryable>(
    nitroApp: NitroAppWithOptionalDb<T>
): Promise<boolean> {
    if (!nitroApp.db) {
        return false
    }

    try {
        await nitroApp.db.query('SELECT 1')
        return true
    } catch {
        return false
    }
}
