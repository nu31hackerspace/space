import type { Collection } from 'mongodb'
import type { ContentBlock } from '~~/shared/types/content'
import { parseMarkdownToBlocks } from '~~/server/core/content/parse'

// Returns parsed content blocks for a post, using the cached version when available.
// If cachedBlocks is absent, parses rawMarkdown and writes the result back to the DB.
// This avoids re-parsing markdown on every request.
export async function getOrCacheBlocks(
    post: { slug: string; rawMarkdown?: string; cachedBlocks?: ContentBlock[] },
    collection: Pick<Collection, 'updateOne'>
): Promise<ContentBlock[]> {
    if (post.cachedBlocks) {
        return post.cachedBlocks
    }

    const blocks = parseMarkdownToBlocks(post.rawMarkdown || '')

    // Persist the parsed blocks so subsequent requests skip parsing
    await collection.updateOne(
        { slug: post.slug },
        { $set: { cachedBlocks: blocks } }
    )

    return blocks
}
