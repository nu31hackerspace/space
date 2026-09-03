// monobank payment notifications.
//
// This URL is public, so the ECDSA signature is the only thing that separates a
// real notification from someone marking their own order paid — an unverified
// body is rejected before it is even parsed. monobank retries up to three times
// until it gets a 200, so every accepted notification answers 200 even when the
// order needs no change.

import {
    createError,
    defineEventHandler,
    getHeader,
    readRawBody,
    useNitroApp,
    useRuntimeConfig,
} from '#imports'
import { requireDatabase } from '~~/server/core/runtime/database'
import { MERCH_ORDERS, settleOrder } from '~~/server/core/merch/repository'
import { notifyOrderPaid } from '~~/server/core/merch/notify'
import {
    getPublicKey,
    resetPublicKeyCache,
} from '~~/server/core/merch/monobank/client'
import { verifyWebhookSignature } from '~~/server/core/merch/monobank/signature'

interface WebhookPayload {
    invoiceId?: string
    status?: string
    reference?: string
}

export default defineEventHandler(async (event) => {
    const logger = useNitroApp().logger
    const token = useRuntimeConfig().monobankToken

    const signature = getHeader(event, 'x-sign') || ''
    const rawBody = (await readRawBody(event, 'utf8')) || ''

    if (!signature || !rawBody) {
        throw createError({ statusCode: 400, statusMessage: 'Bad request' })
    }

    let verified = false
    try {
        verified = verifyWebhookSignature(
            await getPublicKey(token),
            signature,
            rawBody
        )

        // monobank rotates the key occasionally; the documented recovery is to
        // fetch a fresh one and retry exactly once before giving up.
        if (!verified) {
            resetPublicKeyCache()
            verified = verifyWebhookSignature(
                await getPublicKey(token),
                signature,
                rawBody
            )
        }
    } catch (error) {
        logger.error('Failed to verify monobank webhook signature:', error)
        throw createError({ statusCode: 503, statusMessage: 'Cannot verify' })
    }

    if (!verified) {
        logger.warn('Rejected merch webhook with an invalid signature')
        throw createError({
            statusCode: 403,
            statusMessage: 'Invalid signature',
        })
    }

    let payload: WebhookPayload
    try {
        payload = JSON.parse(rawBody)
    } catch {
        throw createError({ statusCode: 400, statusMessage: 'Invalid JSON' })
    }

    if (!payload.invoiceId || !payload.status) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Incomplete payload',
        })
    }

    const db = requireDatabase(useNitroApp())
    const order = await db
        .collection(MERCH_ORDERS)
        .findOne({ invoiceId: payload.invoiceId })

    if (!order) {
        // Nothing to update, but the notification was genuine — answering 200
        // stops monobank retrying an invoice we do not know about.
        logger.warn(`Merch webhook for unknown invoice ${payload.invoiceId}`)
        return { ok: true }
    }

    const applied = await settleOrder(
        db,
        order,
        payload.status,
        notifyOrderPaid
    )

    if (applied.changed) {
        logger.info(
            `Merch order ${order.reference} is now ${applied.status} (monobank: ${payload.status})`
        )
    }

    return { ok: true }
})
