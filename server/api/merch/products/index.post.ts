import {
    createError,
    defineEventHandler,
    readMultipartFormData,
    useNitroApp,
} from '#imports'
import { requireDatabase } from '~~/server/core/runtime/database'
import { randomBytes } from 'node:crypto'
import {
    buildProductSlug,
    parseProductInput,
    SLUG_SUFFIX_LENGTH,
    toProductResponse,
} from '~~/server/core/merch/product'
import { MAX_PRODUCT_IMAGES } from '~~/shared/types/merch'
import { MERCH_PRODUCTS } from '~~/server/core/merch/repository'
import { FileStoreType } from '~~/server/plugins/3_file_store'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
]
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
    const db = requireDatabase(useNitroApp())

    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No data submitted',
        })
    }

    // Gallery order follows upload order, and the first image becomes the
    // cover in the storefront grid.
    const imageFiles: { filename: string; data: Buffer; type?: string }[] = []
    const fields: Record<string, string> = {}

    for (const field of formData) {
        if (!field.data) {
            continue
        }
        if (field.name === 'images') {
            imageFiles.push({
                filename: field.filename || 'image',
                data: field.data,
                type: field.type,
            })
        } else if (field.name) {
            fields[field.name] = field.data.toString('utf-8')
        }
    }

    const parsed = parseProductInput({
        name: fields.name || '',
        description: fields.description || '',
        price: fields.price || '',
    })

    if (!parsed.ok) {
        throw createError({ statusCode: 400, statusMessage: parsed.error })
    }

    if (imageFiles.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'At least one image is required',
        })
    }

    if (imageFiles.length > MAX_PRODUCT_IMAGES) {
        throw createError({
            statusCode: 400,
            statusMessage: `A product can have at most ${MAX_PRODUCT_IMAGES} images`,
        })
    }

    // Every file is validated before any of them is written, so a bad third
    // image cannot leave the first two orphaned in GridFS.
    for (const imageFile of imageFiles) {
        if (imageFile.data.length > MAX_FILE_SIZE) {
            throw createError({
                statusCode: 400,
                statusMessage: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
            })
        }

        if (!isValidImageFile(imageFile.filename, imageFile.type)) {
            throw createError({
                statusCode: 400,
                statusMessage:
                    'Invalid file type. Only jpg, jpeg, png, gif, and webp are allowed',
            })
        }
    }

    try {
        const fileStore = useNitroApp().fileStores.getFileStore(
            FileStoreType.MerchProductImage
        )

        const imageFilenames: string[] = []
        for (const imageFile of imageFiles) {
            const ext = getFileExtension(imageFile.filename)
            const filename = `merch-${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`
            logger.info(`Saving merch product image to GridFS: ${filename}`)
            await fileStore.saveFileFromBuffer(imageFile.data, filename)
            imageFilenames.push(filename)
        }

        const now = new Date()
        const slug = buildProductSlug(
            parsed.value.name,
            randomBytes(SLUG_SUFFIX_LENGTH)
                .toString('hex')
                .slice(0, SLUG_SUFFIX_LENGTH)
        )

        const document = {
            slug,
            name: parsed.value.name,
            description: parsed.value.description,
            priceKopecks: parsed.value.priceKopecks,
            imageFilenames,
            isAvailable: true,
            createdAt: now,
            updatedAt: now,
            createdBy: user.userId,
        }

        const result = await db.collection(MERCH_PRODUCTS).insertOne(document)
        logger.info(`Merch product created with ID: ${result.insertedId}`)

        return toProductResponse({ ...document, _id: result.insertedId })
    } catch (error) {
        logger.error('Failed to create merch product:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create merch product',
        })
    }
})
