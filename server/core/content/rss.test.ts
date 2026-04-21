import { describe, expect, it } from 'vitest'
import { renderRssFeed, inferImageMimeType } from './rss'

describe('rss feed renderer', () => {
    it('renders rss 2.0 xml with namespace, escaped values and items', () => {
        const xml = renderRssFeed({
            title: 'NU31 Blog',
            feedUrl: 'https://space.example/rss.xml',
            siteUrl: 'https://space.example',
            description: 'Updates & experiments',
            language: 'uk-UA',
            lastBuildDate: '2025-02-04T15:30:00.000Z',
            items: [
                {
                    id: 'https://space.example/blog/orbital-log',
                    title: 'Orbital <Log>',
                    url: 'https://space.example/blog/orbital-log',
                    description: 'Station & module "A"',
                    contentHtml: '<p>Full article content.</p>',
                    publishedAt: '2025-01-31T09:00:00.000Z',
                    updatedAt: '2025-02-04T15:30:00.000Z',
                    categories: ['space', 'ops'],
                    mediaThumbnail: 'https://space.example/media/station-cover.png',
                },
            ],
        })

        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
        expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">')
        expect(xml).toContain('<atom:link href="https://space.example/rss.xml" rel="self" type="application/rss+xml" />')
        expect(xml).toContain('<title>Orbital &lt;Log&gt;</title>')
        expect(xml).toContain('<content:encoded><![CDATA[<p>Full article content.</p>]]></content:encoded>')
        expect(xml).toContain('<guid isPermaLink="false">https://space.example/blog/orbital-log</guid>')
        expect(xml).toContain('<category>space</category>')
        expect(xml).toContain('<media:thumbnail url="https://space.example/media/station-cover.png" type="image/png" />')
        expect(xml).toContain('<pubDate>Fri, 31 Jan 2025 09:00:00 GMT</pubDate>')
        expect(xml).toContain('<lastBuildDate>Tue, 04 Feb 2025 15:30:00 GMT</lastBuildDate>')
    })

    it('includes type attribute on media:thumbnail with correct MIME type', () => {
        const xml = renderRssFeed({
            title: 'NU31 Blog',
            feedUrl: 'https://space.example/rss.xml',
            siteUrl: 'https://space.example',
            description: 'Updates',
            language: 'uk-UA',
            lastBuildDate: '2025-02-04T15:30:00.000Z',
            items: [{
                id: 'https://space.example/blog/post',
                title: 'Post',
                url: 'https://space.example/blog/post',
                description: '',
                contentHtml: '',
                publishedAt: '2025-01-31T09:00:00.000Z',
                updatedAt: '2025-02-04T15:30:00.000Z',
                categories: [],
                mediaThumbnail: 'https://cdn.example.com/image.jpg',
            }],
        })

        expect(xml).toContain('type="image/jpeg"')
    })

    it('omits media:thumbnail entirely when not set', () => {
        const xml = renderRssFeed({
            title: 'NU31 Blog',
            feedUrl: 'https://space.example/rss.xml',
            siteUrl: 'https://space.example',
            description: 'Updates',
            language: 'uk-UA',
            lastBuildDate: '2025-02-04T15:30:00.000Z',
            items: [{
                id: 'https://space.example/blog/post',
                title: 'Post',
                url: 'https://space.example/blog/post',
                description: '',
                contentHtml: '',
                publishedAt: '2025-01-31T09:00:00.000Z',
                updatedAt: '2025-02-04T15:30:00.000Z',
                categories: [],
            }],
        })

        expect(xml).not.toContain('media:thumbnail')
    })

    it('omits optional tags when custom fields are empty', () => {
        const xml = renderRssFeed({
            title: 'NU31 Blog',
            feedUrl: 'https://space.example/rss.xml',
            siteUrl: 'https://space.example',
            description: 'Updates',
            language: 'uk-UA',
            lastBuildDate: '2025-02-04T15:30:00.000Z',
            items: [
                {
                    id: 'https://space.example/blog/orbital-log',
                    title: 'Orbital Log',
                    url: 'https://space.example/blog/orbital-log',
                    description: 'Station update',
                    contentHtml: '',
                    publishedAt: '2025-01-31T09:00:00.000Z',
                    updatedAt: '2025-02-04T15:30:00.000Z',
                    categories: [],
                    customFields: {},
                },
            ],
        })

        expect(xml).not.toContain('media:thumbnail')
    })
})

describe('inferImageMimeType', () => {
    it.each([
        ['https://example.com/img.jpg', 'image/jpeg'],
        ['https://example.com/img.jpeg', 'image/jpeg'],
        ['https://example.com/img.png', 'image/png'],
        ['https://example.com/img.gif', 'image/gif'],
        ['https://example.com/img.webp', 'image/webp'],
        ['https://example.com/img.avif', 'image/avif'],
        ['https://example.com/img.svg', 'image/svg+xml'],
        ['https://cdn.discordapp.com/attachments/123/456/image', 'image/jpeg'],
        ['https://example.com/img.bmp', 'image/jpeg'],
        ['https://example.com/img.jpg?size=800', 'image/jpeg'],
    ])('%s → %s', (url, expected) => {
        expect(inferImageMimeType(url)).toBe(expected)
    })
})
