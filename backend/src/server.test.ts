import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, it } from 'vitest'
import type { Queryable } from './database.js'
import { createBackendServer } from './server.js'

describe('backend HTTP server', () => {
    let closeServer: (() => Promise<void>) | undefined

    afterEach(async () => {
        if (closeServer) {
            await closeServer()
            closeServer = undefined
        }
    })

    async function startTestServer(db: Queryable | undefined) {
        const server = createBackendServer(db)
        await new Promise<void>((resolve) => server.listen(0, resolve))
        const { port } = server.address() as AddressInfo
        closeServer = () =>
            new Promise<void>((resolve, reject) =>
                server.close((err) => (err ? reject(err) : resolve()))
            )
        return `http://127.0.0.1:${port}`
    }

    it('returns 200 healthy on GET /api/service/health when database answers', async () => {
        const baseUrl = await startTestServer({
            query: async () => ({ rows: [{ '?column?': 1 }] }),
        })

        const res = await fetch(`${baseUrl}/api/service/health`)
        expect(res.status).toBe(200)
        expect(await res.text()).toBe('healthy')
    })

    it('returns 503 unhealthy on GET /api/service/health when database fails', async () => {
        const baseUrl = await startTestServer({
            query: async () => {
                throw new Error('connection refused')
            },
        })

        const res = await fetch(`${baseUrl}/api/service/health`)
        expect(res.status).toBe(503)
        expect(await res.text()).toBe('unhealthy')
    })

    it('sets a session-key cookie and inserts a tracking record on POST /api/track', async () => {
        const queries: { sql: string; values?: unknown[] }[] = []
        const baseUrl = await startTestServer({
            query: async (sql, values) => {
                queries.push({ sql, values })
                return {}
            },
        })

        const res = await fetch(`${baseUrl}/api/track`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'cf-ipcountry': 'UA',
            },
            body: JSON.stringify({
                action: 'page_view',
                data: { page: 'landing' },
            }),
        })

        expect(res.status).toBe(204)
        const setCookie = res.headers.get('set-cookie')
        expect(setCookie).toMatch(
            /^session-key=[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12};/i
        )
        expect(queries).toHaveLength(1)
        expect(queries[0]?.values?.[0]).toBe('page_view')
        expect(queries[0]?.values?.[1]).toBe('UA')
        expect(queries[0]?.values?.[2]).toEqual({ page: 'landing' })
    })
})
