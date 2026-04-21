// Renders a valid RSS 2.0 feed with optional extensions:
//   dc:creator (author), content:encoded (full HTML body), media:thumbnail (cover image).
// All values are XML-escaped; content:encoded uses CDATA to allow raw HTML inside the envelope.
import type { PublicFeedEntry } from './publication'

const MIME_BY_EXTENSION: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    svg: 'image/svg+xml',
}

// Infers an image MIME type from the URL file extension.
// Defaults to image/jpeg for CDN URLs that have no extension (e.g. Discord CDN).
export function inferImageMimeType(url: string): string {
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? ''
    return MIME_BY_EXTENSION[ext] ?? 'image/jpeg'
}

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
        const creatorXml = item.author ? `<dc:creator>${escapeXml(item.author)}</dc:creator>` : ''
        const contentEncodedXml = item.contentHtml
            ? `<content:encoded><![CDATA[${item.contentHtml}]]></content:encoded>`
            : ''
        const mediaThumbnailXml = item.mediaThumbnail
            ? `<media:thumbnail url="${escapeXml(item.mediaThumbnail)}" type="${inferImageMimeType(item.mediaThumbnail)}" />`
            : ''

        return [
            '<item>',
            `<title>${escapeXml(item.title)}</title>`,
            `<link>${escapeXml(item.url)}</link>`,
            `<guid isPermaLink="false">${escapeXml(item.id)}</guid>`,
            `<pubDate>${formatRfc822Date(item.publishedAt)}</pubDate>`,
            `<lastBuildDate>${formatRfc822Date(item.updatedAt)}</lastBuildDate>`,
            creatorXml,
            categoriesXml,
            mediaThumbnailXml,
            contentEncodedXml,
            '</item>',
        ].join('')
    }).join('')

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">',
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
