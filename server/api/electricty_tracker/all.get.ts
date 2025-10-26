import { defineEventHandler, createError, useNitroApp } from '#imports'
import type { ElectricityTracker } from '~~/shared/types/electricity_device'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        })
    }

    const db = useNitroApp().db

    const trackers = await db
        .collection('electricity_trackers')
        .find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .toArray()

    const trackerSlugs = trackers.map((t: any) => t.slug)
    const aliveDocs = await db
        .collection('electricity_tracker_alive')
        .aggregate([
            { $match: { deviceSlug: { $in: trackerSlugs } } },
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: '$deviceSlug',
                    lastAlive: { $first: '$timestamp' }
                }
            }
        ])
        .toArray()

    const lastAliveMap: Record<string, Date> = {}
    for (const doc of aliveDocs) {
        lastAliveMap[doc._id] = doc.lastAlive
    }


    return {
        trackers: trackers.map((t: any): ElectricityTracker => ({
            name: t.name,
            slug: t.slug,
            createdAt: t.createdAt,
            lastAlive: lastAliveMap[t.slug],
        }))
    }
})
