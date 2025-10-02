import { defineEventHandler, getCookie, readBody, useNitroApp } from '#imports'
import { saveTrackRecordInBackground, TrackDBRecord } from '~~/server/tracking/add'
import { COUNTRY_HEADER_NAME, TRACKING_COOKIE_NAME } from '~~/server/tracking/const'
import { TrackRequest } from '~~/shared/types/track_body'

export default defineEventHandler(async (event) => {
    const sessionKey = getCookie(event, TRACKING_COOKIE_NAME) as string
    const trackRequest = await readBody<TrackRequest>(event)

    const country = event.node.req.headers[COUNTRY_HEADER_NAME] as string

    const trackRecond: TrackDBRecord = {
        action: trackRequest.action,
        country: country,
        data: trackRequest.data,
        sessionKey: sessionKey,
        timestamp: new Date(),
    }

    saveTrackRecordInBackground(trackRecond)
})