import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createServer } from 'node:http'
import type { Queryable } from './database.js'
import { pingDatabase } from './database.js'
import type { TrackDBRecord, TrackRequest } from './tracking/add.js'
import { saveTrackRecordInBackground } from './tracking/add.js'
import {
    COUNTRY_HEADER_NAME,
    TRACKING_COOKIE_MAX_AGE_MS,
    TRACKING_COOKIE_NAME,
    TRACKING_SESSION_KEY_RE,
} from './tracking/const.js'

export function parseCookie(
    cookieHeader: string | undefined,
    name: string
): string | undefined {
    if (!cookieHeader) {
        return undefined
    }

    for (const part of cookieHeader.split(';')) {
        const [rawKey, ...rawVal] = part.trim().split('=')
        if (rawKey === name) {
            return decodeURIComponent(rawVal.join('='))
        }
    }

    return undefined
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
    const chunks: Buffer[] = []
    for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    const raw = Buffer.concat(chunks).toString('utf8')
    return JSON.parse(raw) as T
}

export function createRequestHandler(db: Queryable | undefined) {
    return async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url ?? '/', 'http://localhost')

        if (req.method === 'GET' && url.pathname === '/api/service/health') {
            const isConnected = await pingDatabase(db)

            res.statusCode = isConnected ? 200 : 503
            res.setHeader('Content-Type', 'text/plain; charset=utf-8')
            res.end(isConnected ? 'healthy' : 'unhealthy')
            return
        }

        if (req.method === 'POST' && url.pathname === '/api/track') {
            if (!db) {
                res.statusCode = 503
                res.setHeader('Content-Type', 'text/plain; charset=utf-8')
                res.end('Database is not ready')
                return
            }

            let sessionKey = parseCookie(
                req.headers.cookie,
                TRACKING_COOKIE_NAME
            )

            if (!sessionKey || !TRACKING_SESSION_KEY_RE.test(sessionKey)) {
                sessionKey = randomUUID()
                const expires = new Date(
                    Date.now() + TRACKING_COOKIE_MAX_AGE_MS
                ).toUTCString()
                res.setHeader(
                    'Set-Cookie',
                    `${TRACKING_COOKIE_NAME}=${encodeURIComponent(sessionKey)}; Path=/; Expires=${expires}`
                )
            }

            let trackRequest: TrackRequest
            try {
                trackRequest = await readJsonBody<TrackRequest>(req)
            } catch {
                res.statusCode = 400
                res.setHeader('Content-Type', 'text/plain; charset=utf-8')
                res.end('Invalid JSON body')
                return
            }

            const countryHeader = req.headers[COUNTRY_HEADER_NAME]
            const country = Array.isArray(countryHeader)
                ? countryHeader[0]
                : countryHeader

            const trackRecord: TrackDBRecord = {
                action: trackRequest.action,
                country,
                data: trackRequest.data ?? {},
                sessionKey,
                timestamp: new Date(),
            }

            saveTrackRecordInBackground(db, trackRecord)

            res.statusCode = 204
            res.end()
            return
        }

        res.statusCode = 404
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end('Not Found')
    }
}

export function createBackendServer(db: Queryable | undefined) {
    return createServer(createRequestHandler(db))
}
