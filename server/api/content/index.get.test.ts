import { beforeEach, describe, expect, it, vi } from 'vitest'

const getQueryMock = vi.fn()
const useNitroAppMock = vi.fn()
const useRuntimeConfigMock = vi.fn()

vi.mock('#imports', () => ({
    createError: (options: { statusCode: number; statusMessage: string }) =>
        Object.assign(new Error(options.statusMessage), options),
    defineEventHandler: <T>(handler: T) => handler,
    getQuery: getQueryMock,
    useNitroApp: useNitroAppMock,
    useRuntimeConfig: useRuntimeConfigMock,
}))

describe('GET /api/content', () => {
    beforeEach(() => {
        vi.resetModules()
        vi.clearAllMocks()
        useNitroAppMock.mockReturnValue({})
        useRuntimeConfigMock.mockReturnValue({ public: { baseUrl: 'https://space.test' } })
    })

    it('returns 400 when tag exceeds the supported length', async () => {
        getQueryMock.mockReturnValue({ tag: 'a'.repeat(101) })

        const handler = (await import('./index.get')).default

        await expect(handler({})).rejects.toMatchObject({
            statusCode: 400,
            statusMessage: 'tag too long',
        })
    })

    it('does not turn unexpected query helper failures into 400 errors', async () => {
        getQueryMock.mockReturnValue({ tag: 'space' })

        const queryModule = await import('~~/server/core/content/query')
        vi.spyOn(queryModule, 'buildContentQuery').mockImplementation(() => {
            throw new Error('boom')
        })

        const handler = (await import('./index.get')).default

        try {
            await handler({})
        } catch (error: any) {
            expect(error.message).toBe('boom')
            expect(error.statusCode).toBeUndefined()
            return
        }

        throw new Error('Expected handler to throw')
    })
})
