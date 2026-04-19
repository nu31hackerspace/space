// GET /api/blog/:slug/preview — lets the owner preview a draft before publishing.
// Returns the post in the same PublicArticle format used by the public page,
// but without prev/next navigation and regardless of publication status.
// Only the post owner may access; other authenticated users get 403.
import { createError, defineEventHandler, getRouterParam, useNitroApp, useRuntimeConfig } from '#imports'
import { assertPostOwner } from '~~/server/core/blog/ownership'
import { buildPublicArticle, type BlogPostRecord } from '~~/server/core/content/publication'
import { requireDatabase } from '~~/server/core/runtime/database'
import type { ContentBlock, ContentResponse } from '~~/shared/types/content'

// Minimal local type covering all fields returned by the DB projection below.
// Using a typed collection avoids double-casting with `as unknown as` at the call site.
interface PreviewPostProjection extends BlogPostRecord {
    cachedBlocks?: ContentBlock[]
    owner_id?: string
}

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Slug required' })
    }

    const db = requireDatabase(useNitroApp())
    const post = await db.collection<PreviewPostProjection>('blogPosts').findOne(
        { slug },
        {
            projection: {
                _id: 0,
                slug: 1,
                title: 1,
                status: 1,
                rawMarkdown: 1,
                cachedBlocks: 1,
                tags: 1,
                coverImageUrl: 1,
                coverImageAlt: 1,
                isFeatured: 1,
                authorName: 1,
                publishedAt: 1,
                updatedAt: 1,
                createdAt: 1,
                owner_id: 1,
            },
        }
    )

    if (!post) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    assertPostOwner(post, user.userId)

    const config = useRuntimeConfig(event)
    const baseUrl = config.public.baseUrl as string

    const article = buildPublicArticle(post, baseUrl)

    const response: ContentResponse = {
        ...article,
        prevPost: null,
        nextPost: null,
    }

    return response
})
