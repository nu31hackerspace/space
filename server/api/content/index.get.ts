import { createError, defineEventHandler, getQuery, useNitroApp, useRuntimeConfig } from '#imports'
import { buildPublicArticleListResponse } from '~~/server/core/content/publication'
import { buildContentQuery, buildPaginationParams } from '~~/server/core/content/query'
import { requireDatabase } from '~~/server/core/runtime/database'

export default defineEventHandler(async (event) => {
    const rawQuery = getQuery(event) as Record<string, string>
    const { page, pageSize } = buildPaginationParams(rawQuery)
    let filter: Record<string, unknown>

    try {
        filter = buildContentQuery(rawQuery)
    } catch (error) {
        throw createError({
            statusCode: 400,
            statusMessage: error instanceof Error ? error.message : 'Invalid content query',
        })
    }

    const config = useRuntimeConfig(event)
    const baseUrl = config.public.baseUrl

    const db = requireDatabase(useNitroApp())
    const [items, total] = await Promise.all([
        db.collection('blogPosts').aggregate([
            { $match: filter },
            { $sort: { publishedAt: -1, createdAt: -1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
            { $lookup: {
                from: 'blogPostViews',
                localField: 'slug',
                foreignField: 'slug',
                as: '_views',
            }},
            { $addFields: { views: { $size: '$_views' } } },
            { $project: {
                _id: 0,
                slug: 1,
                title: 1,
                rawMarkdown: 1,
                status: 1,
                tags: 1,
                coverImageUrl: 1,
                coverImageAlt: 1,
                isFeatured: 1,
                authorName: 1,
                publishedAt: 1,
                createdAt: 1,
                updatedAt: 1,
                views: 1,
            }},
        ]).toArray(),
        db.collection('blogPosts').countDocuments(filter),
    ])

    return buildPublicArticleListResponse(items, { baseUrl, page, pageSize, total })
})
