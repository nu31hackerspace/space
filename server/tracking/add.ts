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
    requireDatabase(useNitroApp()).collection('tracking').insertOne(record)
}
