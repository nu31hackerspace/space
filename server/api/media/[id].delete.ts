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
        // Find the post
        const post = await db.collection('mediaPosts').findOne({ _id: new ObjectId(id) })

        if (!post) {
            throw createError({ statusCode: 404, statusMessage: 'Media post not found' })
        }

        // Delete image from GridFS if it exists
        if (post.imageFilename) {
            try {
                const fileStore = useNitroApp().fileStores.getFileStore(FileStoreType.MediaPostImage)
                await fileStore.deleteFileByName(post.imageFilename)
                logger.info(`Deleted image file: ${post.imageFilename}`)
            } catch (error) {
                logger.warn(`Failed to delete image file: ${post.imageFilename}`, error)
                // Continue with post deletion even if image deletion fails
            }
        }

        // Delete post from MongoDB
        await db.collection('mediaPosts').deleteOne({ _id: new ObjectId(id) })

        logger.info(`Media post deleted: ${id}`)

        return { ok: true }
    } catch (error: any) {
        logger.error('Failed to delete media post:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to delete media post'
        })
    }
})

