import { defineEventHandler, getQuery, useNitroApp } from '#imports'
import { requireDatabase } from '~~/server/core/runtime/database'
import { toProductResponse } from '~~/server/core/merch/product'
import { MERCH_PRODUCTS } from '~~/server/core/merch/repository'

export default defineEventHandler(async (event) => {
    const db = requireDatabase(useNitroApp())

    // The storefront sees only what can be bought; the admin page asks for
    // everything so sold-out items stay editable.
    const wantsAll =
        getQuery(event).all === 'true' && Boolean(event.context.user)
    const filter = wantsAll ? {} : { isAvailable: { $ne: false } }

    const products = await db
        .collection(MERCH_PRODUCTS)
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray()

    return products.map(toProductResponse)
})
