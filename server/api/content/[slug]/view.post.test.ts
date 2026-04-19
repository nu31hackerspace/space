import { beforeEach, describe, expect, it, vi } from 'vitest'

const getRouterParamMock = vi.fn()
const getCookieMock = vi.fn()
const useNitroAppMock = vi.fn()
const requireDatabaseMock = vi.fn()

vi.mock('#imports', () => ({
    createError: (options: { statusCode: number; statusMessage: string }) =>
        Object.assign(new Error(options.statusMessage), options),
    defineEventHandler: <T>(handler: T) => handler,
    getCookie: getCookieMock,
    getRouterParam: getRouterParamMock,
    useNitroApp: useNitroAppMock,
}))

vi.mock('~~/server/core/runtime/database', () => ({
    requireDatabase: requireDatabaseMock,
}))

describe('POST /api/content/[slug]/view', () => {
    beforeEach(() => {
        vi.resetModules()
        vi.clearAllMocks()
        getRouterParamMock.mockReturnValue('orbital-log')
        useNitroAppMock.mockReturnValue({})
    })

    it('ignores malformed tracking cookies and still returns the current view count', async () => {
        const insertOneMock = vi.fn()
        const countDocumentsMock = vi.fn().mockResolvedValue(7)
        const findOneMock = vi.fn().mockResolvedValue({ slug: 'orbital-log' })

        getCookieMock.mockReturnValue('not-a-uuid')
        requireDatabaseMock.mockReturnValue({
            collection: (name: string) => {
                if (name === 'blogPosts') {
                    return { findOne: findOneMock }
                }

                if (name === 'blogPostViews') {
                    return {
                        insertOne: insertOneMock,
                        countDocuments: countDocumentsMock,
                    }
                }

                throw new Error(`Unexpected collection ${name}`)
            },
        })

        const handler = (await import('./view.post')).default

        await expect(handler({})).resolves.toEqual({
            counted: false,
            views: 7,
        })

        expect(insertOneMock).not.toHaveBeenCalled()
        expect(countDocumentsMock).toHaveBeenCalledWith({ slug: 'orbital-log' })
    })
})
