import { createError, defineEventHandler, getRouterParam, useNitroApp } from '#imports'
import { assertPostOwner } from '~~/server/core/blog/ownership'
import { requireDatabase } from '~~/server/core/runtime/database'

// Deletes a blog post by slug.
// Only the original author (owner_id) may delete their own post.
// Returns 401 if not authenticated, 404 if the post does not exist, 403 if not the owner.
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

    const post = await db.collection('blogPosts').findOne({ slug })
    if (!post) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    // Only the original author may delete the post.
    assertPostOwner(post, user.userId)

    await db.collection('blogPosts').deleteOne({ slug })

    return { ok: true }
})
