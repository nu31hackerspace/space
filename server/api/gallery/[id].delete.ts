import { createError, defineEventHandler, getRouterParam, useNitroApp } from '#imports'
import { ObjectId } from 'mongodb'
import { FileStoreType } from '~~/server/plugins/3_file_store'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const id = getRouterParam(event, 'id') as string

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: 'ID is required' })
    }

    const db = useNitroApp().db
    const logger = useNitroApp().logger

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid ID format' })
    }

    try {
        // Find the image
        const image = await db.collection('galleryImages').findOne({ _id: new ObjectId(id) })

        if (!image) {
            throw createError({ statusCode: 404, statusMessage: 'Gallery image not found' })
        }

        // Delete image from GridFS if it exists
        if (image.imageFilename) {
            try {
                const fileStore = useNitroApp().fileStores.getFileStore(FileStoreType.LandingGalleryImage)
                await fileStore.deleteFileByName(image.imageFilename)
                logger.info(`Deleted image file: ${image.imageFilename}`)
            } catch (error) {
                logger.warn(`Failed to delete image file: ${image.imageFilename}`, error)
                // Continue with image deletion even if file deletion fails
            }
        }

        // Delete image from MongoDB
        await db.collection('galleryImages').deleteOne({ _id: new ObjectId(id) })

        logger.info(`Gallery image deleted: ${id}`)

        return { ok: true }
    } catch (error: any) {
        logger.error('Failed to delete gallery image:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to delete gallery image'
        })
    }
})

