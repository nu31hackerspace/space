import type { PublicFeedEntry } from './publication'

export interface RssFeedDocument {
    title: string
    feedUrl: string
    siteUrl: string
    description: string
    language: string
    lastBuildDate: string
    items: PublicFeedEntry[]
}

function escapeXml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;')
}

function formatRfc822Date(value: string): string {
    return new Date(value).toUTCString()
}

function renderOptionalTag(tagName: string, value: string | undefined): string {
    if (!value) {
        return ''
    }

    return `<${tagName}>${escapeXml(value)}</${tagName}>`
}

export function renderRssFeed(feed: RssFeedDocument): string {
    const itemsXml = feed.items.map((item) => {
        const categoriesXml = item.categories
            .map(category => `<category>${escapeXml(category)}</category>`)
            .join('')
        const customFieldsXml = Object.entries(item.customFields)
            .filter(([, value]) => Boolean(value))
            .map(([name, value]) => `<space:${name}>${escapeXml(value)}</space:${name}>`)
            .join('')

        return [
            '<item>',
            `<title>${escapeXml(item.title)}</title>`,
            `<link>${escapeXml(item.url)}</link>`,
            `<guid isPermaLink="false">${escapeXml(item.id)}</guid>`,
            `<description>${escapeXml(item.description)}</description>`,
            `<pubDate>${formatRfc822Date(item.publishedAt)}</pubDate>`,
            `<lastBuildDate>${formatRfc822Date(item.updatedAt)}</lastBuildDate>`,
            categoriesXml,
            customFieldsXml,
            '</item>',
        ].join('')
    }).join('')

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:space="https://space.nu31/rss">',
        '<channel>',
        `<title>${escapeXml(feed.title)}</title>`,
        `<link>${escapeXml(feed.siteUrl)}</link>`,
        `<description>${escapeXml(feed.description)}</description>`,
        `<language>${escapeXml(feed.language)}</language>`,
        `<lastBuildDate>${formatRfc822Date(feed.lastBuildDate)}</lastBuildDate>`,
        `<atom:link href="${escapeXml(feed.feedUrl)}" rel="self" type="application/rss+xml" />`,
        itemsXml,
        '</channel>',
        '</rss>',
    ].join('')
}
