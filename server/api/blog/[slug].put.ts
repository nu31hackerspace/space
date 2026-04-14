import { createError, defineEventHandler, getRouterParam, readBody, useNitroApp } from '#imports'
import { normalizeBlogPostWriteInput } from '~~/server/core/content/metadata'
import { assertPostOwner } from '~~/server/core/blog/ownership'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Slug required' })
    }

    const body = await readBody<{
        markdown?: string
        title?: string
        status?: 'draft' | 'published'
        summary?: string
        tags?: string[]
        coverImageUrl?: string
        coverImageAlt?: string
        isFeatured?: boolean
    }>(event)
    const now = new Date()

    const db = useNitroApp().db

    const post = await db.collection('blogPosts').findOne({ slug })
    if (!post) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    // Only the original author may edit the post.
    assertPostOwner(post, user.userId)

    let updates
    try {
        updates = normalizeBlogPostWriteInput({
            mode: 'update',
            body,
            existingPost: {
                publishedAt: post.publishedAt,
            },
            now,
        })
    } catch (error: any) {
        throw createError({ statusCode: 400, statusMessage: error.message })
    }

    const ops: any = { $set: { updatedAt: now, ...updates } }

    if (typeof body?.markdown === 'string') {
        ops.$push = {
            versions: {
                editor_id: user.userId,
                markdown: updates.rawMarkdown,
                createdAt: now,
            }
        }
    }

    await db.collection('blogPosts').updateOne({ slug }, ops)

    return { ok: true }
})

