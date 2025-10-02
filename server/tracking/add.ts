import { useNitroApp } from "#imports"

export type TrackDBRecord = {
    action: string
    country: string
    data: Record<string, string>
    sessionKey: string
    timestamp: Date
}

export function saveTrackRecordInBackground(record: TrackDBRecord) {
    const nitroApp = useNitroApp()
    nitroApp.db.collection('tracking').insertOne(record)
}
