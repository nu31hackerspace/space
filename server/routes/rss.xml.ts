import { queryCollection } from '@nuxt/content/nitro'
import { defineEventHandler, setHeader } from 'h3'
import { create } from 'xmlbuilder2'
import { contentDate } from '../../shared/blog'

const siteUrl = 'https://nu31.space'

export default defineEventHandler(async (event) => {
    const posts = await queryCollection(event, 'blog')
        .order('date', 'DESC')
        .all()

    const rss = create({ version: '1.0', encoding: 'UTF-8' }).ele('rss', {
        version: '2.0',
        'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
    })
    const channel = rss.ele('channel')
    channel.ele('title').txt('Блог NU31')
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
        item.ele('dc:creator').txt(post.author)
        for (const tag of post.tags) item.ele('category').txt(tag)
    }

    setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
    return rss.end({ prettyPrint: true })
})
