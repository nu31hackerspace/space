import { describe, expect, it } from 'vitest'
import { renderRssFeed } from './rss'

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
                    customFields: {
                        coverImage: 'https://space.example/media/station-cover.png',
                        coverImageAlt: 'Station & cover',
                    },
                },
            ],
        })

        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
        expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:space="https://space.nu31/rss">')
        expect(xml).toContain('<atom:link href="https://space.example/rss.xml" rel="self" type="application/rss+xml" />')
        expect(xml).toContain('<title>Orbital &lt;Log&gt;</title>')
        expect(xml).toContain('<content:encoded><![CDATA[<p>Full article content.</p>]]></content:encoded>')
        expect(xml).toContain('<guid isPermaLink="false">https://space.example/blog/orbital-log</guid>')
        expect(xml).toContain('<category>space</category>')
        expect(xml).toContain('<space:coverImage>https://space.example/media/station-cover.png</space:coverImage>')
        expect(xml).toContain('<space:coverImageAlt>Station &amp; cover</space:coverImageAlt>')
        expect(xml).toContain('<pubDate>Fri, 31 Jan 2025 09:00:00 GMT</pubDate>')
        expect(xml).toContain('<lastBuildDate>Tue, 04 Feb 2025 15:30:00 GMT</lastBuildDate>')
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

        expect(xml).not.toContain('space:coverImage')
        expect(xml).not.toContain('space:coverImageAlt')
    })
})
