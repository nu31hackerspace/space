import { createError } from 'h3'
import type { Db } from 'mongodb'

interface NitroAppWithOptionalDb {
    db?: Db
}

interface WaitOptions {
    maxWaitTimeMs?: number
    checkIntervalMs?: number
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

export async function pingDatabase(nitroApp: NitroAppWithOptionalDb): Promise<boolean> {
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

export async function waitForDatabase(
    nitroApp: NitroAppWithOptionalDb,
    options: WaitOptions = {}
): Promise<boolean> {
    const maxWaitTimeMs = options.maxWaitTimeMs ?? 10000
    const checkIntervalMs = options.checkIntervalMs ?? 50
    const startTime = Date.now()

    while (!nitroApp.db) {
        if (Date.now() - startTime > maxWaitTimeMs) {
            return false
        }

        await new Promise(resolve => setTimeout(resolve, checkIntervalMs))
    }

    return true
}
