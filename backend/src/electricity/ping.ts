import { timingSafeEqual } from 'node:crypto'
import type { Queryable } from '../database.js'

export type LastElectricityResponse = {
    lastSeenAt: string | null
}

export function isValidElectricityToken(
    received: string | null,
    expected: string | undefined
): boolean {
    if (!received || !expected) {
        return false
    }

    const receivedBuffer = Buffer.from(received)
    const expectedBuffer = Buffer.from(expected)
    if (receivedBuffer.length !== expectedBuffer.length) {
        return false
    }

    return timingSafeEqual(receivedBuffer, expectedBuffer)
}

export async function saveElectricityPing(db: Queryable, timestamp: Date) {
    await db.query('INSERT INTO electricity_pings (timestamp) VALUES ($1)', [
        timestamp,
    ])
}

export async function getLastElectricityPing(
    db: Queryable
): Promise<Date | null> {
    const result = (await db.query(
        'SELECT MAX(timestamp) AS last_seen_at FROM electricity_pings'
    )) as { rows: { last_seen_at: Date | null }[] }

    return result.rows[0]?.last_seen_at ?? null
}
