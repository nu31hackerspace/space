import { createError } from 'h3'
import type { Db } from 'mongodb'

interface NitroAppWithOptionalDb {
    db?: Db
}

export function requireDatabase(nitroApp: NitroAppWithOptionalDb): Db {
    if (!nitroApp.db) {
        throw createError({
            statusCode: 503,
            statusMessage: 'Database is not ready',
        })
    }

    return nitroApp.db
}

export async function pingDatabase(
    nitroApp: NitroAppWithOptionalDb
): Promise<boolean> {
    if (!nitroApp.db) {
        return false
    }

    try {
        await nitroApp.db.command({ ping: 1 })
        return true
    } catch {
        return false
    }
}
