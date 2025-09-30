import { defineEventHandler, getCookie, setCookie, useNitroApp } from '#imports'
import { randomUUID } from 'crypto'
import { TRACKING_COOKIE_NAME } from '~~/server/tracking/const'

export default defineEventHandler((event) => {
    const sessionKey = getCookie(event, TRACKING_COOKIE_NAME)

    if (!sessionKey) {
        setCookie(event, TRACKING_COOKIE_NAME, randomUUID())
    }
})
