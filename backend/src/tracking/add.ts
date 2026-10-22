import type { Queryable } from '../database.js'

export type TrackRequest = {
    action: string
    data: Record<string, string>
}

export type TrackDBRecord = {
    action: string
    country: string | undefined
    data: Record<string, string>
    sessionKey: string
    timestamp: Date
}

export function saveTrackRecordInBackground(
    db: Queryable,
    record: TrackDBRecord
) {
    db.query(
        `INSERT INTO tracking (action, country, data, session_key, timestamp)
         VALUES ($1, $2, $3, $4, $5)`,
        [
            record.action,
            record.country,
            record.data,
            record.sessionKey,
            record.timestamp,
        ]
    ).catch((error) => {
        console.error('Failed to save tracking record:', error)
    })
}
