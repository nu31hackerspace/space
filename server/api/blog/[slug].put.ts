import { createError, defineEventHandler, getRouterParam, readBody, useNitroApp } from '#imports'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Slug required' })
    }

    const body = await readBody<{ markdown?: string; title?: string; status?: 'draft' | 'published' }>(event)
    const updates: any = {}
    const now = new Date()

    if (typeof body?.title === 'string') updates.title = body.title.trim()
    if (typeof body?.status === 'string') updates.status = body.status

    const db = useNitroApp().db

    const post = await db.collection('blogPosts').findOne({ slug })
    if (!post) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    const ops: any = { $set: { updatedAt: now, ...updates } }

    if (typeof body?.markdown === 'string') {
        ops.$set.rawMarkdown = body.markdown
        ops.$push = {
            versions: {
                editor_id: user.userId,
                markdown: body.markdown,
                createdAt: now,
            }
        }
    }

    await db.collection('blogPosts').updateOne({ slug }, ops)

    return { ok: true }
})


