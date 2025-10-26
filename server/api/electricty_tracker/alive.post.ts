import { defineEventHandler, getRouterParam, createError, getHeader, useRuntimeConfig, useNitroApp } from '#imports'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    const authToken = getHeader(event, 'Authorization') as string
    if (!authToken) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        })
    }

    const deviceJWTToken = authToken.split(' ')[1]

    const decoded = jwt.verify(deviceJWTToken, useRuntimeConfig().jwtSecret) as { trackerSlug: string }

    const db = useNitroApp().db
    const device = await db.collection('electricity_trackers').findOne({ slug: decoded.trackerSlug })

    if (!device) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Device not found',
        })
    }

    const record = {
        deviceSlug: device.slug,
        timestamp: new Date(),
    }

    await db.collection('electricity_tracker_alive').insertOne(record)

    return {
        success: true,
    }
})