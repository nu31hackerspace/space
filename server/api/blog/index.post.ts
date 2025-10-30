import { createError, defineEventHandler, readBody, useNitroApp } from '#imports'
import { generateSlugFromTitle } from '~~/shared/utils'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = await readBody<{ title: string; markdown: string; status?: 'draft' | 'published' }>(event)
    const title = (body?.title || '').trim()
    const markdown = body?.markdown || ''
    const status = body?.status || 'draft'

    if (!title) {
        throw createError({ statusCode: 400, statusMessage: 'title is required' })
    }

    const db = useNitroApp().db
    const now = new Date()
    const slug = generateSlugFromTitle(title)

    try {
        await db.collection('blogPosts').insertOne({
            slug,
            title,
            owner_id: user.userId,
            rawMarkdown: markdown,
            versions: [
                {
                    editor_id: user.userId,
                    markdown,
                    createdAt: now,
                }
            ],
            status,
            createdAt: now,
            updatedAt: now,
        })
    } catch (e: any) {
        if (e?.code === 11000) {
            throw createError({ statusCode: 409, statusMessage: 'Slug already exists' })
        }
        throw createError({ statusCode: 500, statusMessage: 'Failed to create post' })
    }

    return { ok: true, slug }
})


