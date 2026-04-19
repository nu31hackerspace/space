import { beforeEach, describe, expect, it, vi } from 'vitest'

const useNitroAppMock = vi.fn()
const requireDatabaseMock = vi.fn()

vi.mock('#imports', () => ({
    defineEventHandler: <T>(handler: T) => handler,
    useNitroApp: useNitroAppMock,
}))

vi.mock('~~/server/core/runtime/database', () => ({
    requireDatabase: requireDatabaseMock,
}))

describe('GET /api/content/tags', () => {
    beforeEach(() => {
        vi.resetModules()
        vi.clearAllMocks()
        useNitroAppMock.mockReturnValue({})
    })

    it('limits the public tag cloud aggregation to the top 100 tags', async () => {
        const aggregateMock = vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([{ tag: 'space', count: 3 }]),
        })

        requireDatabaseMock.mockReturnValue({
            collection: () => ({
                aggregate: aggregateMock,
            }),
        })

        const handler = (await import('./tags.get')).default

        await expect(handler({} as never)).resolves.toEqual({
            tags: [{ tag: 'space', count: 3 }],
        })

        const pipeline = aggregateMock.mock.calls[0][0]
        expect(pipeline).toContainEqual({ $sort: { count: -1, _id: 1 } })
        expect(pipeline).toContainEqual({ $limit: 100 })
    })
})
