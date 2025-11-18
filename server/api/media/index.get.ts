import { defineEventHandler, useNitroApp } from '#imports'

export default defineEventHandler(async (event) => {
    const db = useNitroApp().db

    const posts = await db
        .collection('mediaPosts')
        .find({})
        .sort({ createdAt: -1 })
        .toArray()

    // Convert _id to string id
    const postsWithId = posts.map(post => ({
        id: post._id.toString(),
        title: post.title,
        sourceUrl: post.sourceUrl,
        imageFilename: post.imageFilename,
        createdAt: post.createdAt
    }))

    return postsWithId
})

