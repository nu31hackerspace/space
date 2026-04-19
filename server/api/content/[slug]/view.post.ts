// POST /api/content/:slug/view — records a page view for an article.
// One view per (slug, sessionKey) pair, enforced by a unique DB index.
// Duplicate inserts (11000) are silently ignored so the response is always 200.
// Only well-formed UUID session keys are accepted; malformed cookies are skipped entirely.
import { createError, defineEventHandler, getRouterParam, getCookie, useNitroApp } from '#imports'
import { requireDatabase } from '~~/server/core/runtime/database'
import { isValidTrackingSessionKey, TRACKING_COOKIE_NAME } from '~~/server/tracking/const'

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Slug required' })
    }

    const db = requireDatabase(useNitroApp())

    const post = await db.collection('blogPosts').findOne(
        { slug, status: 'published' },
        { projection: { _id: 0, slug: 1 } }
    )
    if (!post) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    const sessionKey = getCookie(event, TRACKING_COOKIE_NAME) || ''
    let counted = false

    if (isValidTrackingSessionKey(sessionKey)) {
        try {
            await db.collection('blogPostViews').insertOne({
                slug,
                sessionKey,
                createdAt: new Date(),
            })
            counted = true
        } catch (e: any) {
            if (e?.code !== 11000) throw e
        }
    }

    const views = await db.collection('blogPostViews').countDocuments({ slug })

    return { counted, views }
})
