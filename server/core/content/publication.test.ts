import { describe, expect, it } from 'vitest'
import {
    buildPublicArticle,
    buildPublicArticleListItem,
    buildPublicArticleListResponse,
    buildPublicFeedEntry,
} from './publication'

describe('publication helpers', () => {
    const basePost = {
        slug: 'orbital-log',
        title: 'Orbital Log',
        rawMarkdown: [
            '# Heading',
            '',
            'The first paragraph explains what happened on orbit.',
            '',
            'The second paragraph adds more context.',
        ].join('\n'),
        status: 'published',
        createdAt: new Date('2025-02-03T10:00:00.000Z'),
        updatedAt: new Date('2025-02-04T15:30:00.000Z'),
    }

    it('builds a public list item with metadata fallbacks', () => {
        const item = buildPublicArticleListItem({
            ...basePost,
            tags: ['space', 'station'],
            coverImageUrl: '/media/cover.png',
            isFeatured: true,
        }, 'https://space.example')

        expect(item).toEqual({
            slug: 'orbital-log',
            title: 'Orbital Log',
            excerpt: 'The first paragraph explains what happened on orbit.',
            tags: ['space', 'station'],
            coverImageUrl: 'https://space.example/media/cover.png',
            coverImageAlt: '',
            status: 'published',
            isFeatured: true,
            authorName: '',
            url: 'https://space.example/blog/orbital-log',
            publishedAt: '2025-02-03T10:00:00.000Z',
            updatedAt: '2025-02-04T15:30:00.000Z',
            views: 0,
        })
    })

    it('extracts excerpt from the first text paragraph', () => {
        const item = buildPublicArticleListItem(basePost, 'https://space.example')

        expect(item.excerpt).toBe('The first paragraph explains what happened on orbit.')
        expect(item.tags).toEqual([])
        expect(item.coverImageUrl).toBe('')
        expect(item.coverImageAlt).toBe('')
        expect(item.publishedAt).toBe('2025-02-03T10:00:00.000Z')
    })

    it('builds a full public article with parsed blocks and stable dates', () => {
        const article = buildPublicArticle({
            ...basePost,
            publishedAt: new Date('2025-01-31T09:00:00.000Z'),
            coverImageAlt: 'Station viewport',
        }, 'https://space.example')

        expect(article.slug).toBe('orbital-log')
        expect(article.excerpt).toBe('The first paragraph explains what happened on orbit.')
        expect(article.coverImageAlt).toBe('Station viewport')
        expect(article.url).toBe('https://space.example/blog/orbital-log')
        expect(article.publishedAt).toBe('2025-01-31T09:00:00.000Z')
        expect(article.blocks).toHaveLength(3)
    })

    it('removes the leading heading block when it duplicates the article title', () => {
        const article = buildPublicArticle({
            ...basePost,
            rawMarkdown: [
                '# Orbital Log',
                '',
                'The first paragraph explains what happened on orbit.',
            ].join('\n'),
        }, 'https://space.example')

        expect(article.blocks).toEqual([
            {
                type: 'text',
                content: 'The first paragraph explains what happened on orbit.',
            },
        ])
    })

    it('filters out drafts from list responses', () => {
        const response = buildPublicArticleListResponse([
            basePost,
            {
                ...basePost,
                slug: 'draft-log',
                status: 'draft',
            },
        ], {
            baseUrl: 'https://space.example',
            page: 2,
            pageSize: 10,
            total: 1,
        })

        expect(response).toEqual({
            items: [
                expect.objectContaining({
                    slug: 'orbital-log',
                }),
            ],
            page: 2,
            pageSize: 10,
            total: 1,
        })
    })

    it('produces identical publishedAt and updatedAt ISO strings when both point to the same moment', () => {
        const sameDate = new Date('2025-01-31T09:00:00.000Z')

        const article = buildPublicArticle({
            ...basePost,
            publishedAt: sameDate,
            updatedAt: sameDate,
        }, 'https://space.example')

        expect(article.publishedAt).toBe(article.updatedAt)
    })

    it('builds feed entries with content HTML and custom metadata tags', () => {
        const entry = buildPublicFeedEntry({
            ...basePost,
            tags: ['space', 'ops'],
            coverImageUrl: '/media/station-cover.png',
            coverImageAlt: 'Station cover',
            publishedAt: new Date('2025-01-31T09:00:00.000Z'),
        }, 'https://space.example')

        expect(entry).toEqual({
            id: 'https://space.example/blog/orbital-log',
            title: 'Orbital Log',
            url: 'https://space.example/blog/orbital-log',
            description: 'The first paragraph explains what happened on orbit.',
            contentHtml: expect.stringContaining('<p>The first paragraph explains what happened on orbit.</p>'),
            publishedAt: '2025-01-31T09:00:00.000Z',
            updatedAt: '2025-02-04T15:30:00.000Z',
            categories: ['space', 'ops'],
            author: undefined,
            customFields: {
                coverImage: 'https://space.example/media/station-cover.png',
                coverImageAlt: 'Station cover',
            },
        })
    })
})
