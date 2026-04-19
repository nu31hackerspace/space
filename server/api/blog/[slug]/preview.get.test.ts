import { beforeEach, describe, expect, it, vi } from 'vitest'

const getRouterParamMock = vi.fn()
const useNitroAppMock = vi.fn()
const useRuntimeConfigMock = vi.fn()
const requireDatabaseMock = vi.fn()
const assertPostOwnerMock = vi.fn()
const buildPublicArticleMock = vi.fn()

vi.mock('#imports', () => ({
    createError: (options: { statusCode: number; statusMessage: string }) =>
        Object.assign(new Error(options.statusMessage), options),
    defineEventHandler: <T>(handler: T) => handler,
    getRouterParam: getRouterParamMock,
    useNitroApp: useNitroAppMock,
    useRuntimeConfig: useRuntimeConfigMock,
}))

vi.mock('~~/server/core/runtime/database', () => ({
    requireDatabase: requireDatabaseMock,
}))

vi.mock('~~/server/core/blog/ownership', () => ({
    assertPostOwner: assertPostOwnerMock,
}))

vi.mock('~~/server/core/content/publication', () => ({
    buildPublicArticle: buildPublicArticleMock,
}))

describe('GET /api/blog/[slug]/preview', () => {
    beforeEach(() => {
        vi.resetModules()
        vi.clearAllMocks()
        getRouterParamMock.mockReturnValue('orbital-log')
        useNitroAppMock.mockReturnValue({})
        useRuntimeConfigMock.mockReturnValue({ public: { baseUrl: 'https://space.test' } })
    })

    it('returns the preview article with empty navigation links', async () => {
        const post = {
            slug: 'orbital-log',
            title: 'Orbital Log',
            status: 'draft',
            rawMarkdown: '# Orbital Log',
            cachedBlocks: [],
            tags: ['space'],
            coverImageUrl: '',
            coverImageAlt: '',
            isFeatured: false,
            authorName: '',
            owner_id: 'user-1',
        }

        requireDatabaseMock.mockReturnValue({
            collection: () => ({
                findOne: vi.fn().mockResolvedValue(post),
            }),
        })

        buildPublicArticleMock.mockReturnValue({
            slug: 'orbital-log',
            title: 'Orbital Log',
            excerpt: 'Excerpt',
            tags: ['space'],
            coverImageUrl: '',
            coverImageAlt: '',
            status: 'draft',
            isFeatured: false,
            authorName: '',
            url: 'https://space.test/blog/orbital-log',
            publishedAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
            views: 0,
            blocks: [],
        })

        const handler = (await import('./preview.get')).default

        await expect(handler({ context: { user: { userId: 'user-1', sessionKey: 'session-1' } } })).resolves.toEqual({
            slug: 'orbital-log',
            title: 'Orbital Log',
            excerpt: 'Excerpt',
            tags: ['space'],
            coverImageUrl: '',
            coverImageAlt: '',
            status: 'draft',
            isFeatured: false,
            authorName: '',
            url: 'https://space.test/blog/orbital-log',
            publishedAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
            views: 0,
            blocks: [],
            prevPost: null,
            nextPost: null,
        })

        expect(assertPostOwnerMock).toHaveBeenCalledWith(post, 'user-1')
        expect(buildPublicArticleMock).toHaveBeenCalledWith(post, 'https://space.test')
    })
})
