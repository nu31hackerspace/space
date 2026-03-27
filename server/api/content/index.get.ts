import { defineEventHandler, getQuery, useNitroApp, useRuntimeConfig } from '#imports'
import { buildPublicArticleListResponse } from '~~/server/core/content/publication'

export default defineEventHandler(async (event) => {
    const { page = '1', pageSize = '20' } = getQuery(event) as Record<string, string>
    const p = Math.max(parseInt(page, 10) || 1, 1)
    const ps = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100)
    const config = useRuntimeConfig(event)
    const baseUrl = config.public.baseUrl

    const db = useNitroApp().db
    const cursor = db
        .collection('blogPosts')
        .find(
            { status: 'published' },
            {
                projection: {
                    _id: 0,
                    slug: 1,
                    title: 1,
                    rawMarkdown: 1,
                    status: 1,
                    summary: 1,
                    tags: 1,
                    coverImageUrl: 1,
                    coverImageAlt: 1,
                    isFeatured: 1,
                    publishedAt: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            }
        )
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((p - 1) * ps)
        .limit(ps)

    const [items, total] = await Promise.all([
        cursor.toArray(),
        db.collection('blogPosts').countDocuments({ status: 'published' }),
    ])

    return buildPublicArticleListResponse(items, {
        baseUrl,
        page: p,
        pageSize: ps,
        total,
    })
})
