import { useNitroApp } from '#imports'
import { requireDatabase } from '~~/server/core/runtime/database'

export type TrackDBRecord = {
    action: string
    country: string
    data: Record<string, string>
    sessionKey: string
    timestamp: Date
}

export function saveTrackRecordInBackground(record: TrackDBRecord) {
    const nitroApp = useNitroApp()
    requireDatabase(nitroApp)
        .query(
            `INSERT INTO tracking (action, country, data, session_key, timestamp)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                record.action,
                record.country,
                record.data,
                record.sessionKey,
                record.timestamp,
            ]
        )
        .catch((error) => {
            nitroApp.logger.error('Failed to save tracking record:', error)
        })
}
