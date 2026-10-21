import { describe, expect, it } from 'vitest'
import { pingDatabase, requireDatabase } from './database'

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

    it('returns true from ping when database answers a query', async () => {
        const db = {
            query: async () => ({ rows: [{ '?column?': 1 }] }),
        }

        await expect(pingDatabase({ db })).resolves.toBe(true)
    })
})
