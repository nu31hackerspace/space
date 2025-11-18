import { createError, defineEventHandler, readMultipartFormData, useNitroApp } from '#imports'
import { FileStoreType } from '~~/server/plugins/3_file_store'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

function getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.')
    return lastDot >= 0 ? filename.substring(lastDot).toLowerCase() : ''
}

function isValidImageFile(filename: string, mimeType?: string): boolean {
    const ext = getFileExtension(filename)
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return false
    }
    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
        return false
    }
    return true
}

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const logger = useNitroApp().logger
    const db = useNitroApp().db

    try {
        const formData = await readMultipartFormData(event)

        if (!formData || formData.length === 0) {
            throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
        }

        let imageFile: { filename: string; data: Buffer; type?: string } | null = null
        let altText = ''

        // Parse form data
        for (const field of formData) {
            if (field.name === 'image' && field.data) {
                imageFile = {
                    filename: field.filename || 'image',
                    data: field.data,
                    type: field.type
                }
            } else if (field.name === 'altText' && field.data) {
                altText = field.data.toString('utf-8').trim()
            }
        }

        if (!imageFile) {
            throw createError({ statusCode: 400, statusMessage: 'Image file is required' })
        }

        // Validate file
        if (imageFile.data.length > MAX_FILE_SIZE) {
            throw createError({ statusCode: 400, statusMessage: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` })
        }

        if (!isValidImageFile(imageFile.filename, imageFile.type)) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid file type. Only jpg, jpeg, png, gif, and webp are allowed' })
        }

        // Generate unique filename
        const ext = getFileExtension(imageFile.filename)
        const imageFilename = `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`

        // Save image to GridFS
        const fileStore = useNitroApp().fileStores.getFileStore(FileStoreType.LandingGalleryImage)
        logger.info(`Saving gallery image to GridFS: ${imageFilename}`)
        await fileStore.saveFileFromBuffer(imageFile.data, imageFilename)

        // Save image metadata to MongoDB
        const now = new Date()
        const result = await db.collection('galleryImages').insertOne({
            imageFilename: imageFilename,
            altText: altText || undefined,
            createdAt: now,
            updatedAt: now,
            createdBy: user.userId
        })

        logger.info(`Gallery image created with ID: ${result.insertedId}`)

        return {
            id: result.insertedId.toString(),
            imageFilename: imageFilename,
            altText: altText,
            createdAt: now
        }
    } catch (error: any) {
        logger.error('Failed to create gallery image:', error)
        if (error.statusCode) {
            throw error
        }
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to upload gallery image'
        })
    }
})

