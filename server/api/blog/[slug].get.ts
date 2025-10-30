import { createError, defineEventHandler, getRouterParam, useNitroApp } from '#imports'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Slug required' })
    }

    const db = useNitroApp().db
    const post = await db.collection('blogPosts').findOne(
        { slug },
        { projection: { _id: 0, slug: 1, title: 1, status: 1, rawMarkdown: 1, updatedAt: 1, createdAt: 1 } }
    )
    if (!post) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    return post
})


