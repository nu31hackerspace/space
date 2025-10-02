import { defineEventHandler, getCookie, readBody, useNitroApp } from '#imports'
import { TRACKING_COOKIE_NAME } from '~~/server/tracking/const'
import { TrackRequest } from '~~/shared/types/track_body'

export default defineEventHandler(async (event) => {
    const sessionKey = getCookie(event, TRACKING_COOKIE_NAME)
    const trackRequest = await readBody<TrackRequest>(event)

    const trackRecond = {
        action: trackRequest.action,
        data: trackRequest.data,
        sessionKey: sessionKey,
        timestamp: new Date(),
    }

    const db = useNitroApp().db

    await db.collection('tracking').insertOne(trackRecond)
})