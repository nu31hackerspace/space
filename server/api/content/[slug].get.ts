import { createError, defineEventHandler, getRouterParam, useNitroApp } from '#imports'
import type { ContentResponse } from '~~/shared/types/content'
import { parseMarkdownToBlocks } from '~~/server/core/content/parse'

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')
    if (!slug) {
        throw createError({ statusCode: 400, statusMessage: 'Slug parameter is required' })
    }

    const db = useNitroApp().db
    const post = await db.collection('blogPosts').findOne({ slug })
    if (!post) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' })
    }

    const rawMarkdown: string = post.rawMarkdown || ''
    const blocks = parseMarkdownToBlocks(rawMarkdown)

    const response: ContentResponse = { blocks }
    return response
})

