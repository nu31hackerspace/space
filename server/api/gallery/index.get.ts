import { defineEventHandler, useNitroApp } from '#imports'

export default defineEventHandler(async (event) => {
    const db = useNitroApp().db

    const images = await db
        .collection('galleryImages')
        .find({})
        .sort({ order: 1, createdAt: -1 })
        .toArray()

    // Convert _id to string id
    const imagesWithId = images.map(image => ({
        id: image._id.toString(),
        imageFilename: image.imageFilename,
        altText: image.altText || '',
        createdAt: image.createdAt
    }))

    return imagesWithId
})

