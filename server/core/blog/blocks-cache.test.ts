import { describe, it, expect, vi } from 'vitest'
import { getOrCacheBlocks } from './blocks-cache'

// Minimal mock of a MongoDB collection
function makeCollection(doc: Record<string, any>) {
    return {
        updateOne: vi.fn(),
        // findOne is not used here — post is passed in directly
    }
}

describe('getOrCacheBlocks', () => {
    it('returns cachedBlocks from the post without calling the parser or DB when cache is present', async () => {
        const cachedBlocks = [{ type: 'text', content: 'cached' }]
        const post = { slug: 'my-post', rawMarkdown: '# Hello', cachedBlocks }
        const collection = makeCollection(post)

        const blocks = await getOrCacheBlocks(post, collection as any)

        expect(blocks).toEqual(cachedBlocks)
        expect(collection.updateOne).not.toHaveBeenCalled()
    })

    it('parses rawMarkdown and saves cachedBlocks to DB when cache is missing', async () => {
        const post = { slug: 'my-post', rawMarkdown: '# Hello' }
        const collection = makeCollection(post)

        const blocks = await getOrCacheBlocks(post, collection as any)

        expect(blocks).toEqual([{ type: 'header', size: '1', title: 'Hello' }])
        expect(collection.updateOne).toHaveBeenCalledWith(
            { slug: 'my-post' },
            { $set: { cachedBlocks: [{ type: 'header', size: '1', title: 'Hello' }] } }
        )
    })

    it('returns empty array for post with no markdown and no cache', async () => {
        const post = { slug: 'empty-post', rawMarkdown: '' }
        const collection = makeCollection(post)

        const blocks = await getOrCacheBlocks(post, collection as any)

        expect(blocks).toEqual([])
    })
})
