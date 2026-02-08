import { defineEventHandler, getQuery, useNitroApp } from '#imports'

export default defineEventHandler(async (event) => {
    const { page = '1', pageSize = '20' } = getQuery(event) as Record<string, string>
    const p = Math.max(parseInt(page, 10) || 1, 1)
    const ps = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100)

    const db = useNitroApp().db
    const cursor = db
        .collection('blogPosts')
        .find(
            { status: 'published' },
            { projection: { _id: 0, slug: 1, title: 1, createdAt: 1, updatedAt: 1 } }
        )
        .sort({ createdAt: -1 })
        .skip((p - 1) * ps)
        .limit(ps)

    const [items, total] = await Promise.all([
        cursor.toArray(),
        db.collection('blogPosts').countDocuments({ status: 'published' }),
    ])

    return { items, page: p, pageSize: ps, total }
})
