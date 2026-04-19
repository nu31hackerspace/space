import { createError, defineEventHandler, getRouterParam, useNitroApp, useRuntimeConfig } from '#imports'
import type { ContentResponse } from '~~/shared/types/content'
import { buildContentResponse } from '~~/server/core/content/publication'
import { requireDatabase } from '~~/server/core/runtime/database'
import { getOrCacheBlocks } from '~~/server/core/blog/blocks-cache'
import { pickNavPost } from '~~/server/core/content/navigation'

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
                tags: 1,
                coverImageUrl: 1,
                coverImageAlt: 1,
                isFeatured: 1,
                authorName: 1,
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

    // Fetch the immediately adjacent published posts by publishedAt for prev/next navigation.
    // "prev" is the post published just before this one (older), "next" is just after (newer).
    const publishedAt = post.publishedAt ?? post.createdAt
    const [prevRaw, nextRaw] = await Promise.all([
        db.collection('blogPosts').findOne(
            { status: 'published', $or: [
                { publishedAt: { $lt: publishedAt } },
                { publishedAt: { $exists: false }, createdAt: { $lt: post.createdAt } },
            ] },
            { sort: { publishedAt: -1, createdAt: -1 }, projection: { _id: 0, slug: 1, title: 1 } }
        ),
        db.collection('blogPosts').findOne(
            { status: 'published', $or: [
                { publishedAt: { $gt: publishedAt } },
                { publishedAt: { $exists: false }, createdAt: { $gt: post.createdAt } },
            ] },
            { sort: { publishedAt: 1, createdAt: 1 }, projection: { _id: 0, slug: 1, title: 1 } }
        ),
    ])

    const views = await db.collection('blogPostViews').countDocuments({ slug })

    const response: ContentResponse = {
        ...buildContentResponse({ ...post, cachedBlocks: blocks, views }, config.public.baseUrl),
        prevPost: pickNavPost(prevRaw),
        nextPost: pickNavPost(nextRaw),
    }
    return response
})
