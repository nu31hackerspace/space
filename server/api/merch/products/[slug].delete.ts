import {
    createError,
    defineEventHandler,
    getRouterParam,
    useNitroApp,
} from '#imports'
import { requireDatabase } from '~~/server/core/runtime/database'
import {
    findProductBySlug,
    MERCH_PRODUCTS,
} from '~~/server/core/merch/repository'
import { normalizeImageFilenames } from '~~/server/core/merch/product'
import { FileStoreType } from '~~/server/plugins/3_file_store'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const slug = getRouterParam(event, 'slug') as string
    if (!slug) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Slug is required',
        })
    }

    const db = requireDatabase(useNitroApp())
    const logger = useNitroApp().logger

    const product = await findProductBySlug(db, slug)

    if (!product) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Product not found',
        })
    }

    const fileStore = useNitroApp().fileStores.getFileStore(
        FileStoreType.MerchProductImage
    )

    for (const filename of normalizeImageFilenames(product)) {
        try {
            await fileStore.deleteFileByName(filename)
        } catch (error) {
            // Past orders keep their own copy of the item name and price, so a
            // stranded image is cosmetic — not a reason to fail the delete.
            logger.warn(`Failed to delete merch image: ${filename}`, error)
        }
    }

    await db.collection(MERCH_PRODUCTS).deleteOne({ _id: product._id })
    logger.info(`Merch product deleted: ${slug}`)

    return { ok: true }
})
