// Pure order logic: validate what the customer submitted, price the basket,
// and translate monobank invoice statuses into our own order lifecycle.

import type {
    MerchCustomer,
    MerchCustomerInput,
    MerchOrder,
    MerchOrderItem,
    MerchOrderStatus,
    MerchProduct,
} from '~~/shared/types/merch'
import { isValidRef } from '~~/server/core/delivery/novaposhta/parse'
import { fail, ok, type ParseResult } from './result'

const MAX_QUANTITY = 50
const MAX_CUSTOMER_FIELD_LENGTH = 200

// Deliberately permissive: the point is to catch a typo before the customer is
// sent to a payment page, not to adjudicate RFC 5322.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[\d\s()-]{9,20}$/

export function validateCustomer(
    customer: Partial<MerchCustomerInput> | undefined
): ParseResult<MerchCustomerInput> {
    const name = (customer?.name || '').trim()
    if (!name) {
        return fail('Name is required')
    }
    if (name.length > MAX_CUSTOMER_FIELD_LENGTH) {
        return fail('Name is too long')
    }

    const email = (customer?.email || '').trim()
    if (!EMAIL_PATTERN.test(email)) {
        return fail('A valid email is required')
    }
    if (email.length > MAX_CUSTOMER_FIELD_LENGTH) {
        return fail('Email is too long')
    }

    const phone = (customer?.phone || '').trim()
    if (!PHONE_PATTERN.test(phone)) {
        return fail('A valid phone number is required')
    }

    // Only the refs are accepted here. The city and warehouse names are looked
    // up from Nova Poshta before the order is stored, so a browser cannot
    // label a branch as something it is not.
    const cityRef = (customer?.cityRef || '').trim()
    if (!isValidRef(cityRef)) {
        return fail('Choose a delivery city')
    }

    const warehouseRef = (customer?.warehouseRef || '').trim()
    if (!isValidRef(warehouseRef)) {
        return fail('Choose a Nova Poshta branch')
    }

    return ok({ name, email, phone, cityRef, warehouseRef })
}

// Prices come from the stored product, never from the request — the client only
// chooses what and how many. Trusting a client-supplied price would let anyone
// buy a hoodie for one kopeck.
export function buildOrderItem(
    product: MerchProduct,
    quantity: number
): ParseResult<MerchOrderItem> {
    if (!product.isAvailable) {
        return fail('Product is not available')
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        return fail('Quantity must be a positive whole number')
    }
    if (quantity > MAX_QUANTITY) {
        return fail(`Quantity must be at most ${MAX_QUANTITY}`)
    }

    return ok({
        productId: product.id,
        name: product.name,
        quantity,
        priceKopecks: product.priceKopecks,
        sumKopecks: product.priceKopecks * quantity,
    })
}

export function calculateTotalKopecks(items: MerchOrderItem[]): number {
    return items.reduce((total, item) => total + item.sumKopecks, 0)
}

// monobank invoice status → our order status. Returns null for a status we do
// not model, so the caller can leave the order untouched rather than guess.
export function mapInvoiceStatus(status: string): MerchOrderStatus | null {
    switch (status) {
        case 'created':
            return 'created'
        case 'processing':
        case 'hold':
            return 'processing'
        case 'success':
            return 'paid'
        case 'failure':
            return 'failed'
        case 'reversed':
            return 'reversed'
        case 'expired':
            return 'expired'
        default:
            return null
    }
}

const TERMINAL_STATUSES: MerchOrderStatus[] = [
    'paid',
    'failed',
    'expired',
    'reversed',
]

export function isTerminalStatus(status: MerchOrderStatus): boolean {
    return TERMINAL_STATUSES.includes(status)
}

// Webhooks arrive out of order and are retried up to three times, and the
// status poll races them. Both write through this guard so a late `created`
// can never demote an order that is already paid.
export function shouldApplyStatus(
    current: MerchOrderStatus,
    next: MerchOrderStatus
): boolean {
    if (current === next) {
        return false
    }
    // `reversed` is the one transition out of a terminal state: a successful
    // payment can still be refunded afterwards.
    if (current === 'paid') {
        return next === 'reversed'
    }
    return !isTerminalStatus(current)
}

export interface OrderDocument {
    _id: { toString(): string }
    reference?: string
    status?: MerchOrderStatus
    customer?: MerchCustomer
    items?: MerchOrderItem[]
    totalKopecks?: number
    userId?: string | null
    createdAt?: Date
    updatedAt?: Date
}

export function toOrderResponse(order: OrderDocument): MerchOrder {
    const createdAt = order.createdAt || new Date()

    return {
        id: order._id.toString(),
        reference: order.reference || '',
        status: order.status || 'created',
        customer: order.customer || {
            name: '',
            email: '',
            phone: '',
            delivery: {
                cityRef: '',
                cityName: '',
                warehouseRef: '',
                warehouseNumber: '',
                warehouseName: '',
            },
        },
        items: order.items || [],
        totalKopecks: order.totalKopecks || 0,
        userId: order.userId ?? null,
        createdAt: createdAt.toISOString(),
        updatedAt: (order.updatedAt || createdAt).toISOString(),
    }
}
