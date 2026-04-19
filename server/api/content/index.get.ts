// GET /api/content — public paginated list of published posts.
// Supports optional ?tag filter and ?page/?pageSize pagination.
// Tag validation errors (e.g. tag longer than 100 chars) are surfaced as 400.
import { createError, defineEventHandler, getQuery, useNitroApp, useRuntimeConfig } from '#imports'
import { buildPublicArticleListResponse } from '~~/server/core/content/publication'
import { buildContentQuery, buildPaginationParams, ContentQueryValidationError } from '~~/server/core/content/query'
import { requireDatabase } from '~~/server/core/runtime/database'

export default defineEventHandler(async (event) => {
    const rawQuery = getQuery(event) as Record<string, string>
    const { page, pageSize } = buildPaginationParams(rawQuery)
    let filter: Record<string, unknown>

    try {
        filter = buildContentQuery(rawQuery)
    } catch (error) {
        if (!(error instanceof ContentQueryValidationError)) {
            throw error
        }

        throw createError({
            statusCode: 400,
            statusMessage: error.message,
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
