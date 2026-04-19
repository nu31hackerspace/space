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
    const [items, total] = await Promise.all([
        db.collection('blogPosts').aggregate([
            { $match: filter },
            { $sort: { updatedAt: -1 } },
            { $skip: (p - 1) * ps },
            { $limit: ps },
            { $lookup: {
                from: 'blogPostViews',
                localField: 'slug',
                foreignField: 'slug',
                as: '_views',
            }},
            { $addFields: { views: { $size: '$_views' } } },
            { $project: { _id: 0, slug: 1, title: 1, status: 1, updatedAt: 1, createdAt: 1, views: 1 } },
        ]).toArray(),
        db.collection('blogPosts').countDocuments(filter),
    ])

    return { items, page: p, pageSize: ps, total }
})


