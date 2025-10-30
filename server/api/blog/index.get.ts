import { createError, defineEventHandler, getQuery, useNitroApp } from '#imports'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const { page = '1', pageSize = '20', status } = getQuery(event) as any
    const p = Math.max(parseInt(page, 10) || 1, 1)
    const ps = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100)

    const filter: any = {}
    if (status) filter.status = status

    const db = useNitroApp().db
    const cursor = db
        .collection('blogPosts')
        .find(filter, { projection: { _id: 0, slug: 1, title: 1, status: 1, updatedAt: 1, createdAt: 1 } })
        .sort({ updatedAt: -1 })
        .skip((p - 1) * ps)
        .limit(ps)

    const [items, total] = await Promise.all([
        cursor.toArray(),
        db.collection('blogPosts').countDocuments(filter),
    ])

    return { items, page: p, pageSize: ps, total }
})


