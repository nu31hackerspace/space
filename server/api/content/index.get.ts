import { defineEventHandler, getQuery, useNitroApp, useRuntimeConfig } from '#imports'
import { buildPublicArticleListResponse } from '~~/server/core/content/publication'
import { buildContentQuery, buildPaginationParams } from '~~/server/core/content/query'
import { requireDatabase } from '~~/server/core/runtime/database'

export default defineEventHandler(async (event) => {
    const rawQuery = getQuery(event) as Record<string, string>
    const { page, pageSize } = buildPaginationParams(rawQuery)
    const filter = buildContentQuery(rawQuery)

    const config = useRuntimeConfig(event)
    const baseUrl = config.public.baseUrl

    const db = requireDatabase(useNitroApp())
    const cursor = db
        .collection('blogPosts')
        .find(filter, {
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
        })
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)

    const [items, total] = await Promise.all([
        cursor.toArray(),
        db.collection('blogPosts').countDocuments(filter),
    ])

    return buildPublicArticleListResponse(items, { baseUrl, page, pageSize, total })
})
