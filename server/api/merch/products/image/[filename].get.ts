import {
    createError,
    defineEventHandler,
    getRouterParam,
    useNitroApp,
} from '#imports'
import { FileStoreType } from '~~/server/plugins/3_file_store'

export default defineEventHandler(async (event) => {
    const filename = getRouterParam(event, 'filename') as string

    if (!filename) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Filename is required',
        })
    }

    try {
        const fileStore = useNitroApp().fileStores.getFileStore(
            FileStoreType.MerchProductImage
        )
        const imageFile = await fileStore.openDownloadStreamByName(filename)

        let contentType = 'image/jpeg'
        if (filename.endsWith('.png')) {
            contentType = 'image/png'
        } else if (filename.endsWith('.gif')) {
            contentType = 'image/gif'
        } else if (filename.endsWith('.webp')) {
            contentType = 'image/webp'
        }

        event.node.res.setHeader('Content-Type', contentType)
        event.node.res.setHeader('Cache-Control', 'public, max-age=86400')
        return imageFile
    } catch (error) {
        useNitroApp().logger.error(
            'Failed to serve merch product image:',
            error
        )
        throw createError({
            statusCode: 404,
            statusMessage: 'Image not found',
        })
    }
})
