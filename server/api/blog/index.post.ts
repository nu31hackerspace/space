import { createError, defineEventHandler, readBody, useNitroApp } from '#imports'
import { normalizeBlogPostWriteInput } from '~~/server/core/content/metadata'
import { generateSlugFromTitle } from '~~/shared/utils'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = await readBody<{
        title: string
        markdown: string
        status?: 'draft' | 'published'
        summary?: string
        tags?: string[]
        coverImageUrl?: string
        coverImageAlt?: string
        isFeatured?: boolean
        authorName?: string
    }>(event)
    const now = new Date()
    let normalizedBody

    try {
        normalizedBody = normalizeBlogPostWriteInput({
            mode: 'create',
            body,
            now,
        })
    } catch (error: any) {
        throw createError({ statusCode: 400, statusMessage: error.message })
    }

    const db = useNitroApp().db
    const slug = generateSlugFromTitle(normalizedBody.title || '')

    try {
        await db.collection('blogPosts').insertOne({
            slug,
            title: normalizedBody.title,
            owner_id: user.userId,
            rawMarkdown: normalizedBody.rawMarkdown || '',
            versions: [
                {
                    editor_id: user.userId,
                    markdown: normalizedBody.rawMarkdown || '',
                    createdAt: now,
                }
            ],
            status: normalizedBody.status,
            summary: normalizedBody.summary || '',
            tags: normalizedBody.tags || [],
            coverImageUrl: normalizedBody.coverImageUrl || '',
            coverImageAlt: normalizedBody.coverImageAlt || '',
            isFeatured: normalizedBody.isFeatured || false,
            authorName: normalizedBody.authorName || '',
            publishedAt: normalizedBody.publishedAt || null,
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

