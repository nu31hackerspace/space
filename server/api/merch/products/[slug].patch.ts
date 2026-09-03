// Availability toggle — the "sold out" switch. It is the only mutable field:
// changing a price or a name after orders exist would make past orders read as
// something they were not, so a corrected product is deleted and re-added.

import {
    createError,
    defineEventHandler,
    getRouterParam,
    readBody,
    useNitroApp,
} from '#imports'
import { requireDatabase } from '~~/server/core/runtime/database'
import { toProductResponse } from '~~/server/core/merch/product'
import {
    findProductBySlug,
    MERCH_PRODUCTS,
} from '~~/server/core/merch/repository'

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

    const body = await readBody<{ isAvailable?: unknown }>(event)
    if (typeof body?.isAvailable !== 'boolean') {
        throw createError({
            statusCode: 400,
            statusMessage: 'isAvailable must be a boolean',
        })
    }

    const db = requireDatabase(useNitroApp())
    const product = await findProductBySlug(db, slug)

    if (!product) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Product not found',
        })
    }

    const updated = await db
        .collection(MERCH_PRODUCTS)
        .findOneAndUpdate(
            { _id: product._id },
            { $set: { isAvailable: body.isAvailable, updatedAt: new Date() } },
            { returnDocument: 'after' }
        )

    return toProductResponse(updated || product)
})
