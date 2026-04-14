import { createError, defineEventHandler, getRouterParam, useNitroApp, useRuntimeConfig } from '#imports'
import type { ContentResponse } from '~~/shared/types/content'
import { buildContentResponse } from '~~/server/core/content/publication'
import { requireDatabase } from '~~/server/core/runtime/database'
import { getOrCacheBlocks } from '~~/server/core/blog/blocks-cache'

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Slug parameter is required' })
    }

    const config = useRuntimeConfig(event)
    const db = requireDatabase(useNitroApp())
    const post = await db.collection('blogPosts').findOne(
        { slug, status: 'published' },
        {
            projection: {
                _id: 0,
                slug: 1,
                title: 1,
                rawMarkdown: 1,
                cachedBlocks: 1,
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
    if (!post) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    // Use cached blocks if available, otherwise parse and persist them for future requests
    const blocks = await getOrCacheBlocks(post, db.collection('blogPosts'))
    const response: ContentResponse = buildContentResponse({ ...post, cachedBlocks: blocks }, config.public.baseUrl)
    return response
})
