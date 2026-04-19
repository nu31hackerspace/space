import { defineEventHandler, setHeader, useNitroApp, useRuntimeConfig } from '#imports'
import { buildPublicFeedEntry, type BlogPostRecord } from '~~/server/core/content/publication'
import { requireDatabase } from '~~/server/core/runtime/database'
import { renderRssFeed } from '~~/server/core/content/rss'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const baseUrl = config.public.baseUrl
    const feedUrl = new URL('/rss.xml', baseUrl).toString()
    const db = requireDatabase(useNitroApp())

    const posts = await db.collection('blogPosts')
        .find(
            { status: 'published' },
            {
                projection: {
                    _id: 0,
                    slug: 1,
                    title: 1,
                    rawMarkdown: 1,
                    status: 1,
                    tags: 1,
                    coverImageUrl: 1,
                    coverImageAlt: 1,
                    authorName: 1,
                    publishedAt: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            }
        )
        .sort({ publishedAt: -1, createdAt: -1 })
        .toArray()

    const items = posts.map(post => buildPublicFeedEntry(post as unknown as BlogPostRecord, baseUrl))
    const lastBuildDate = items[0]?.updatedAt || new Date().toISOString()
    const xml = renderRssFeed({
        title: 'NU31 Blog',
        feedUrl,
        siteUrl: baseUrl,
        description: 'NU31 blog feed',
        language: 'uk-UA',
        lastBuildDate,
        items,
    })

    setHeader(event, 'content-type', 'application/rss+xml; charset=utf-8')
    return xml
})
