// The one place that writes an order's payment status.
//
// Two independent sources report a payment: the monobank webhook (primary) and
// the status poll the result page performs (fallback for a webhook that never
// arrived). Both funnel through applyInvoiceStatus so the ordering guard in
// shouldApplyStatus is impossible to bypass.

import type { Db, ObjectId } from 'mongodb'
import type { MerchOrder, MerchOrderStatus } from '~~/shared/types/merch'
import type { ProductDocument } from './product'
import {
    mapInvoiceStatus,
    shouldApplyStatus,
    toOrderResponse,
    type OrderDocument,
} from './order'

export const MERCH_PRODUCTS = 'merchProducts'
export const MERCH_ORDERS = 'merchOrders'

export interface StatusUpdateResult {
    status: MerchOrderStatus
    changed: boolean
}

async function applyInvoiceStatus(
    db: Db,
    reference: string,
    currentStatus: MerchOrderStatus,
    invoiceStatus: string
): Promise<StatusUpdateResult> {
    const nextStatus = mapInvoiceStatus(invoiceStatus)

    if (!nextStatus || !shouldApplyStatus(currentStatus, nextStatus)) {
        return { status: currentStatus, changed: false }
    }

    // The status guard is repeated in the filter so two concurrent writers —
    // a webhook retry and a poll — cannot both apply a transition.
    const result = await db.collection(MERCH_ORDERS).updateOne(
        { reference, status: currentStatus },
        {
            $set: {
                status: nextStatus,
                monobankStatus: invoiceStatus,
                updatedAt: new Date(),
            },
        }
    )

    if (result.modifiedCount === 0) {
        return { status: currentStatus, changed: false }
    }

    return { status: nextStatus, changed: true }
}

export type OrderPaidNotifier = (order: MerchOrder) => Promise<void>

// The single entry point both the webhook and the status poll use.
//
// applyInvoiceStatus already guarantees that exactly one caller wins the race
// to a given transition, so hanging the notification off `changed` gives
// send-once semantics for free — without it, a webhook retry racing the result
// page would mail the buyer twice.
//
// The notifier is a parameter rather than a direct import so this module stays
// free of Nitro's `#imports`, which vitest cannot resolve — that is what makes
// the send-once guarantee testable instead of merely asserted.
export async function settleOrder(
    db: Db,
    order: OrderDocument & { reference?: string },
    invoiceStatus: string,
    notifyPaid: OrderPaidNotifier
): Promise<StatusUpdateResult> {
    const reference = order.reference || ''
    const applied = await applyInvoiceStatus(
        db,
        reference,
        order.status || 'created',
        invoiceStatus
    )

    if (applied.changed && applied.status === 'paid') {
        await notifyPaid({ ...toOrderResponse(order), status: 'paid' })
    }

    return applied
}

// Products are addressed by slug everywhere — pages, admin controls and the
// API alike. The driver hands back an untyped Document; narrowing here means
// callers get a real product shape instead of casting at every use site.
export type StoredProduct = ProductDocument & { _id: ObjectId }

export async function findProductBySlug(
    db: Db,
    slug: string
): Promise<StoredProduct | null> {
    const product = await db.collection(MERCH_PRODUCTS).findOne({ slug })

    return (product as StoredProduct | null) ?? null
}
