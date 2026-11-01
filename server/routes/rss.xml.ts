import { queryCollection } from '@nuxt/content/nitro'
import { toHtml } from 'hast-util-to-html'
import { defineEventHandler, setHeader } from 'h3'
import type { Element, ElementContent } from 'hast'
import type { MinimarkNode } from 'minimark'
import { create } from 'xmlbuilder2'
import { contentDate } from '../../shared/blog'

const siteUrl = 'https://nu31.space'

/** Convert Nuxt Content's parsed Markdown nodes into safe HTML for RSS readers. */
function rssContentNode(node: MinimarkNode): ElementContent {
    if (typeof node === 'string') return { type: 'text', value: node }

    const [tagName, attributes, ...children] = node
    const properties = { ...attributes } as Element['properties']
    // Feed readers resolve media against the feed URL, so use canonical site URLs.
    for (const key of ['href', 'src'] as const) {
        const value = properties[key]
        if (
            typeof value === 'string' &&
            value.startsWith('/') &&
            !value.startsWith('//')
        ) {
            properties[key] = new URL(value, siteUrl).href
        }
    }
    return {
        type: 'element',
        tagName,
        properties,
        children: children.map(rssContentNode),
    }
}

export default defineEventHandler(async (event) => {
    const posts = await queryCollection(event, 'blog')
        .order('date', 'DESC')
        .all()

    const rss = create({ version: '1.0', encoding: 'UTF-8' }).ele('rss', {
        version: '2.0',
        'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
        'xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
    })
    const channel = rss.ele('channel')
    channel.ele('title').txt('Блог')
    channel.ele('link').txt(`${siteUrl}/blog/`)
    channel
        .ele('description')
        .txt('Новини, проєкти та події київського хакерспейсу NU31.')
    channel.ele('language').txt('uk-UA')
    channel.ele('lastBuildDate').txt(new Date().toUTCString())

    for (const post of posts) {
        const url = `${siteUrl}${post.path}/`
        const item = channel.ele('item')
        item.ele('title').txt(post.title)
        item.ele('link').txt(url)
        item.ele('guid', { isPermaLink: 'true' }).txt(url)
        item.ele('pubDate').txt(contentDate(post.date).toUTCString())
        item.ele('description').txt(post.description)
        item.ele('content:encoded').dat(
            toHtml({
                type: 'root',
                children: post.body.value.map(rssContentNode),
            })
        )
        item.ele('dc:creator').txt(post.author)
        for (const tag of post.tags) item.ele('category').txt(tag)
    }

    setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
    return rss.end({ prettyPrint: true })
})
