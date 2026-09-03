// Public order status, keyed on the unguessable order reference.
//
// This is the fallback the monobank skill calls for: if the webhook never
// arrived — it is not sent at all for `expired`, and a local dev host is not
// reachable from monobank — the result page polling here still settles the
// order. Only the status and total are exposed; customer details are not.

import {
    createError,
    defineEventHandler,
    getRouterParam,
    useNitroApp,
    useRuntimeConfig,
} from '#imports'
import type { MerchOrderStatusResponse } from '~~/shared/types/merch'
import { requireDatabase } from '~~/server/core/runtime/database'
import { isTerminalStatus } from '~~/server/core/merch/order'
import { MERCH_ORDERS, settleOrder } from '~~/server/core/merch/repository'
import { notifyOrderPaid } from '~~/server/core/merch/notify'
import { getInvoiceStatus } from '~~/server/core/merch/monobank/client'

export default defineEventHandler(
    async (event): Promise<MerchOrderStatusResponse> => {
        // decode: true matters — references are Ukrainian words, so they
        // arrive percent-encoded and would otherwise be looked up literally
        // as '%D1%81...' and never found.
        const reference = getRouterParam(event, 'reference', {
            decode: true,
        }) as string
        if (!reference) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Reference is required',
            })
        }

        const db = requireDatabase(useNitroApp())
        const logger = useNitroApp().logger

        const order = await db.collection(MERCH_ORDERS).findOne({ reference })
        if (!order) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Order not found',
            })
        }

        let status = order.status || 'created'

        if (!isTerminalStatus(status) && order.invoiceId) {
            const token = useRuntimeConfig().monobankToken
            try {
                const invoice = await getInvoiceStatus(token, order.invoiceId)
                const applied = await settleOrder(
                    db,
                    order,
                    invoice.status,
                    notifyOrderPaid
                )
                status = applied.status
            } catch (error) {
                // A provider hiccup should not break the result page — the
                // customer keeps seeing the last known status.
                logger.warn(
                    `Failed to poll monobank status for order ${reference}`,
                    error
                )
            }
        }

        return {
            reference,
            status,
            totalKopecks: order.totalKopecks || 0,
        }
    }
)
