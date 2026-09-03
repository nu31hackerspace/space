// A buyer's own orders, for the profile page. Orders placed while logged out
// have no userId and are reachable only through their result-page link.

import { createError, defineEventHandler, useNitroApp } from '#imports'
import { requireDatabase } from '~~/server/core/runtime/database'
import { toOrderResponse } from '~~/server/core/merch/order'
import { MERCH_ORDERS } from '~~/server/core/merch/repository'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const db = requireDatabase(useNitroApp())

    const orders = await db
        .collection(MERCH_ORDERS)
        .find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray()

    return orders.map(toOrderResponse)
})
