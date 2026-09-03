import {
    createError,
    defineEventHandler,
    getRouterParam,
    useNitroApp,
} from '#imports'
import { requireDatabase } from '~~/server/core/runtime/database'
import { toProductResponse } from '~~/server/core/merch/product'
import { findProductBySlug } from '~~/server/core/merch/repository'

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug') as string

    if (!slug) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Slug is required',
        })
    }

    const db = requireDatabase(useNitroApp())
    const product = await findProductBySlug(db, slug)

    // An unavailable product keeps its page: a link shared while it was in
    // stock should explain that it sold out rather than 404.
    if (!product) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Product not found',
        })
    }

    return toProductResponse(product)
})
