import { describe, expect, it } from 'vitest'
import { pingDatabase, requireDatabase, waitForDatabase } from './database'

describe('runtime database helpers', () => {
    it('throws a 503 error when database is not ready', () => {
        try {
            requireDatabase({})
        } catch (error: any) {
            expect(error.statusCode).toBe(503)
            expect(error.statusMessage).toBe('Database is not ready')
            return
        }

        throw new Error('Expected requireDatabase to throw')
    })

    it('returns false from ping when database is not ready', async () => {
        await expect(pingDatabase({})).resolves.toBe(false)
    })

    it('returns true from ping when database responds to ping', async () => {
        const db = {
            command: async () => ({ ok: 1 }),
        }

        await expect(pingDatabase({ db })).resolves.toBe(true)
    })

    it('waits for an already ready database', async () => {
        const db = { command: async () => ({ ok: 1 }) }

        await expect(waitForDatabase({ db }, { maxWaitTimeMs: 1, checkIntervalMs: 1 })).resolves.toBe(true)
    })

    it('returns false when database does not become ready in time', async () => {
        await expect(waitForDatabase({}, { maxWaitTimeMs: 5, checkIntervalMs: 1 })).resolves.toBe(false)
    })
})
