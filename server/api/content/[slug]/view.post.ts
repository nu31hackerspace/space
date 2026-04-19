import { createError, defineEventHandler, getRouterParam, getCookie, useNitroApp } from '#imports'
import { requireDatabase } from '~~/server/core/runtime/database'
import { TRACKING_COOKIE_NAME } from '~~/server/tracking/const'

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

    if (sessionKey) {
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
