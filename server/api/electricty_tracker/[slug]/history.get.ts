import { defineEventHandler, getRouterParam, createError, useNitroApp } from '#imports'

type Status = 'online' | 'offline'

const TEN_MIN_MS = 10 * 60 * 1000
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
    }

    const db = useNitroApp().db

    const tracker = await db.collection('electricity_trackers').findOne({ slug, userId: user.userId })
    if (!tracker) {
        throw createError({ statusCode: 404, statusMessage: 'Tracker not found' })
    }

    const now = new Date()
    const weekStart = new Date(now.getTime() - SEVEN_DAYS_MS)

    const preWindowPing = await db
        .collection('electricity_tracker_alive')
        .find({ deviceSlug: slug, timestamp: { $lt: weekStart } })
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray()

    const pingsInWindow = await db
        .collection('electricity_tracker_alive')
        .find({ deviceSlug: slug, timestamp: { $gte: weekStart, $lte: now } })
        .sort({ timestamp: 1 })
        .toArray()

    const timestamps: Date[] = pingsInWindow.map((d: any) => d.timestamp as Date)
    const lastPingDoc = await db
        .collection('electricity_tracker_alive')
        .find({ deviceSlug: slug })
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray()

    const lastAliveAt: Date | undefined = lastPingDoc.length ? (lastPingDoc[0].timestamp as Date) : undefined
    const current: { status: Status; lastAliveAt?: Date; since?: Date } = {
        status: lastAliveAt && now.getTime() - lastAliveAt.getTime() <= TEN_MIN_MS ? 'online' : 'offline',
        lastAliveAt,
        since: undefined,
    }

    type Interval = { status: Status; start: Date; end: Date | null }

    const history: Interval[] = []

    let currentState: Status
    let currentStart: Date
    const firstInWindow = timestamps[0]

    if (firstInWindow) {
        const pre = preWindowPing[0]?.timestamp as Date | undefined
        const gapToStart = pre ? firstInWindow.getTime() - pre.getTime() : Infinity
        // If there was a ping shortly before the first in-window ping, consider the device online at week start
        if (pre && (weekStart.getTime() - pre.getTime() <= TEN_MIN_MS || gapToStart <= TEN_MIN_MS)) {
            currentState = 'online'
        } else {
            currentState = 'offline'
        }
    } else {
        // No pings in window
        const pre = preWindowPing[0]?.timestamp as Date | undefined
        if (pre && weekStart.getTime() - pre.getTime() <= TEN_MIN_MS) {
            currentState = 'online'
        } else {
            currentState = 'offline'
        }
    }
    currentStart = new Date(weekStart)

    let prevPing: Date | undefined
    for (const ping of timestamps) {
        if (!prevPing) {
            if (currentState === 'offline') {
                // Transition to online at first ping
                history.push({ status: 'offline', start: currentStart, end: ping })
                currentState = 'online'
                currentStart = ping
            } else {
                // Already online; keep session from week start
                // no interval push here
            }
            prevPing = ping
            continue
        }

        const gap = ping.getTime() - prevPing.getTime()
        if (gap > TEN_MIN_MS) {
            if (currentState === 'online') {
                history.push({ status: 'online', start: currentStart, end: prevPing })
                currentState = 'offline'
                currentStart = prevPing
            }
            // We are offline until this ping
            history.push({ status: 'offline', start: currentStart, end: ping })
            currentState = 'online'
            currentStart = ping
        }
        prevPing = ping
    }

    // Close the current interval to now (end null for current state)
    history.push({ status: currentState, start: currentStart, end: null })

    // Determine current.since from the last interval
    const lastInterval = history[history.length - 1]
    current.since = lastInterval.start

    return {
        tracker: {
            name: tracker.name,
            slug: tracker.slug,
            createdAt: tracker.createdAt,
        },
        current: {
            status: current.status,
            lastAliveAt: current.lastAliveAt,
            since: current.since,
        },
        history: history,
    }
})


