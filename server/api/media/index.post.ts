import { createError, defineEventHandler, readBody, useNitroApp } from '#imports'
import { extractMetadataFromUrl } from '~~/server/core/media/parse'
import { FileStoreType } from '~~/server/plugins/3_file_store'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const body = await readBody<{ url: string }>(event)
    const url = (body?.url || '').trim()

    if (!url) {
        throw createError({ statusCode: 400, statusMessage: 'URL is required' })
    }

    // Validate URL format
    try {
        new URL(url)
    } catch {
        throw createError({ statusCode: 400, statusMessage: 'Invalid URL format' })
    }

    const logger = useNitroApp().logger
    const db = useNitroApp().db

    try {
        // Extract metadata from URL
        logger.info(`Extracting metadata from URL: ${url}`)
        const metadata = await extractMetadataFromUrl(url)

        // Generate unique filename for image
        const imageFilename = `media-post-${Date.now()}-${Math.random().toString(36).slice(2, 9)}.jpg`

        // Download and save image to GridFS
        const fileStore = useNitroApp().fileStores.getFileStore(FileStoreType.MediaPostImage)
        logger.info(`Saving image from ${metadata.imageUrl} to GridFS`)
        await fileStore.saveFileByUrl(metadata.imageUrl, imageFilename)

        // Save post to MongoDB
        const now = new Date()
        const result = await db.collection('mediaPosts').insertOne({
            title: metadata.title,
            sourceUrl: url,
            imageFilename: imageFilename,
            createdAt: now,
            updatedAt: now,
            createdBy: user.userId
        })

        logger.info(`Media post created with ID: ${result.insertedId}`)

        return {
            id: result.insertedId.toString(),
            title: metadata.title,
            sourceUrl: url,
            imageFilename: imageFilename,
            createdAt: now
        }
    } catch (error: any) {
        logger.error('Failed to create media post:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to create media post'
        })
    }
})

