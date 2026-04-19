import { describe, expect, it } from 'vitest'
import { normalizeBlogPostWriteInput } from './metadata'

describe('blog post metadata normalization', () => {
    it('normalizes create payload and stamps publishedAt for published posts', () => {
        const now = new Date('2025-02-04T15:30:00.000Z')

        const payload = normalizeBlogPostWriteInput({
            mode: 'create',
            body: {
                title: '  Orbital Log  ',
                markdown: '# Mission',
                status: 'published',
                tags: [' space ', '', 'ops'],
                coverImageUrl: '/media/cover.png',
                coverImageAlt: '  Cupola  ',
                isFeatured: true,
            },
            now,
        })

        expect(payload).toEqual({
            title: 'Orbital Log',
            rawMarkdown: '# Mission',
            status: 'published',
            tags: ['space', 'ops'],
            coverImageUrl: '/media/cover.png',
            coverImageAlt: 'Cupola',
            isFeatured: true,
            authorName: '',
            publishedAt: now,
        })
    })

    it('preserves existing publishedAt during update', () => {
        const existingPublishedAt = new Date('2025-01-31T09:00:00.000Z')

        const payload = normalizeBlogPostWriteInput({
            mode: 'update',
            body: {
                status: 'published',
            },
            existingPost: {
                publishedAt: existingPublishedAt,
            },
            now: new Date('2025-02-04T15:30:00.000Z'),
        })

        expect(payload).toEqual({
            status: 'published',
        })
    })

    it('rejects blank titles when title is provided', () => {
        expect(() => normalizeBlogPostWriteInput({
            mode: 'update',
            body: {
                title: '   ',
            },
            now: new Date('2025-02-04T15:30:00.000Z'),
        })).toThrow('title is required')
    })

    it('rejects invalid cover image urls', () => {
        expect(() => normalizeBlogPostWriteInput({
            mode: 'create',
            body: {
                title: 'Orbital Log',
                markdown: '',
                status: 'draft',
                coverImageUrl: 'ftp://space.example/cover.png',
            },
            now: new Date('2025-02-04T15:30:00.000Z'),
        })).toThrow('coverImageUrl must be an absolute http(s) URL or a root-relative path')
    })
})
