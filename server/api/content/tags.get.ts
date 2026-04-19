// GET /api/content/tags — returns the top 100 tags from published posts, ordered by usage count.
// Used by the admin tag picker and the public tag cloud/filter UI.
import { defineEventHandler, useNitroApp } from '#imports'
import { requireDatabase } from '~~/server/core/runtime/database'
import type { TagCloudResponse } from '~~/shared/types/content'

export default defineEventHandler(async () => {
    const db = requireDatabase(useNitroApp())
    const tags = await db.collection('blogPosts').aggregate([
        { $match: { status: 'published' } },
        { $unwind: '$tags' },
        { $match: { tags: { $ne: '' } } },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 100 },
        { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]).toArray()

    return { tags } as TagCloudResponse
})
