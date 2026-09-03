import { describe, expect, it } from 'vitest'
import type { MerchProduct } from '~~/shared/types/merch'
import {
    buildOrderItem,
    calculateTotalKopecks,
    isTerminalStatus,
    mapInvoiceStatus,
    shouldApplyStatus,
    toOrderResponse,
    validateCustomer,
} from './order'

const tshirt: MerchProduct = {
    id: 'p1',
    slug: 'futbolka-nu31-a1b2c3',
    name: 'Футболка NU31',
    description: '',
    priceKopecks: 50000,
    imageFilenames: ['merch-1.png'],
    isAvailable: true,
    createdAt: '2026-01-01T00:00:00.000Z',
}

const validCustomer = {
    name: 'Вова',
    email: 'vova@example.com',
    phone: '+380671234567',
    cityRef: '8d5a980d-391c-11dd-90d9-001a92567626',
    warehouseRef: '1ec09d88-e1c2-11e3-8c4a-0050568002cf',
}

describe('merch customer validation', () => {
    it('accepts a filled in form', () => {
        expect(validateCustomer(validCustomer)).toEqual({
            ok: true,
            value: validCustomer,
        })
    })

    it('trims surrounding whitespace', () => {
        const result = validateCustomer({ ...validCustomer, name: '  Вова  ' })

        expect(result.ok && result.value.name).toBe('Вова')
    })

    it('rejects a missing or malformed email', () => {
        expect(validateCustomer({ ...validCustomer, email: '' }).ok).toBe(false)
        expect(validateCustomer({ ...validCustomer, email: 'vova@' }).ok).toBe(
            false
        )
    })

    it('rejects an implausible phone number', () => {
        expect(validateCustomer({ ...validCustomer, phone: '123' }).ok).toBe(
            false
        )
    })

    // Only refs are accepted: the names are resolved from Nova Poshta, so a
    // browser cannot pass off one branch as another.
    it('requires both nova poshta refs', () => {
        expect(validateCustomer({ ...validCustomer, cityRef: '' }).ok).toBe(
            false
        )
        expect(
            validateCustomer({ ...validCustomer, warehouseRef: '' }).ok
        ).toBe(false)
    })

    it('rejects refs that are not uuids', () => {
        expect(validateCustomer({ ...validCustomer, cityRef: 'Київ' }).ok).toBe(
            false
        )
        expect(
            validateCustomer({ ...validCustomer, warehouseRef: '42' }).ok
        ).toBe(false)
    })

    it('rejects an entirely missing customer', () => {
        expect(validateCustomer(undefined).ok).toBe(false)
    })
})

describe('merch order item', () => {
    it('prices the item from the product, not the request', () => {
        const result = buildOrderItem(tshirt, 2)

        expect(result).toEqual({
            ok: true,
            value: {
                productId: 'p1',
                name: 'Футболка NU31',
                quantity: 2,
                priceKopecks: 50000,
                sumKopecks: 100000,
            },
        })
    })

    it('rejects non-positive and fractional quantities', () => {
        expect(buildOrderItem(tshirt, 0).ok).toBe(false)
        expect(buildOrderItem(tshirt, -1).ok).toBe(false)
        expect(buildOrderItem(tshirt, 1.5).ok).toBe(false)
        expect(buildOrderItem(tshirt, 51).ok).toBe(false)
    })

    it('refuses an unavailable product', () => {
        const result = buildOrderItem({ ...tshirt, isAvailable: false }, 1)

        expect(result.ok).toBe(false)
    })
})

describe('merch order total', () => {
    it('sums the item lines', () => {
        const total = calculateTotalKopecks([
            {
                productId: 'p1',
                name: 'a',
                quantity: 2,
                priceKopecks: 50000,
                sumKopecks: 100000,
            },
            {
                productId: 'p2',
                name: 'b',
                quantity: 1,
                priceKopecks: 5000,
                sumKopecks: 5000,
            },
        ])

        expect(total).toBe(105000)
    })

    it('is zero for an empty basket', () => {
        expect(calculateTotalKopecks([])).toBe(0)
    })
})

describe('monobank invoice status mapping', () => {
    it('maps every documented status', () => {
        expect(mapInvoiceStatus('created')).toBe('created')
        expect(mapInvoiceStatus('processing')).toBe('processing')
        expect(mapInvoiceStatus('hold')).toBe('processing')
        expect(mapInvoiceStatus('success')).toBe('paid')
        expect(mapInvoiceStatus('failure')).toBe('failed')
        expect(mapInvoiceStatus('reversed')).toBe('reversed')
        expect(mapInvoiceStatus('expired')).toBe('expired')
    })

    it('returns null for an unknown status so the order is left alone', () => {
        expect(mapInvoiceStatus('something-new')).toBeNull()
    })
})

describe('merch order status transitions', () => {
    it('knows which statuses are terminal', () => {
        expect(isTerminalStatus('paid')).toBe(true)
        expect(isTerminalStatus('failed')).toBe(true)
        expect(isTerminalStatus('created')).toBe(false)
        expect(isTerminalStatus('processing')).toBe(false)
    })

    it('advances an in-flight order', () => {
        expect(shouldApplyStatus('created', 'processing')).toBe(true)
        expect(shouldApplyStatus('processing', 'paid')).toBe(true)
    })

    it('ignores a repeated status', () => {
        expect(shouldApplyStatus('paid', 'paid')).toBe(false)
    })

    // Webhooks are retried up to three times and race the status poll, so an
    // out-of-order `created` must not undo a payment.
    it('never demotes a paid order except to reversed', () => {
        expect(shouldApplyStatus('paid', 'created')).toBe(false)
        expect(shouldApplyStatus('paid', 'processing')).toBe(false)
        expect(shouldApplyStatus('paid', 'failed')).toBe(false)
        expect(shouldApplyStatus('paid', 'reversed')).toBe(true)
    })

    it('leaves other terminal states alone', () => {
        expect(shouldApplyStatus('failed', 'processing')).toBe(false)
        expect(shouldApplyStatus('expired', 'paid')).toBe(false)
    })
})

describe('merch order response shaping', () => {
    it('fills defaults for a sparse document', () => {
        const response = toOrderResponse({ _id: { toString: () => 'o1' } })

        expect(response.id).toBe('o1')
        expect(response.status).toBe('created')
        expect(response.items).toEqual([])
        expect(response.userId).toBeNull()
        expect(response.customer.delivery.cityName).toBe('')
    })

    it('falls back to createdAt when the order was never updated', () => {
        const createdAt = new Date('2026-02-03T10:00:00.000Z')
        const response = toOrderResponse({
            _id: { toString: () => 'o1' },
            createdAt,
        })

        expect(response.updatedAt).toBe('2026-02-03T10:00:00.000Z')
    })
})
