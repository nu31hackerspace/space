import { describe, expect, it } from 'vitest'
import type { MerchOrder } from '~~/shared/types/merch'
import { buildOrderPaidEmail, escapeHtml } from './email-message'

const order: MerchOrder = {
    id: 'o1',
    reference: 'ref-123',
    status: 'paid',
    customer: {
        name: 'Вова',
        email: 'vova@example.com',
        phone: '+380671234567',
        delivery: {
            cityRef: 'city-1',
            cityName: 'Київ',
            warehouseRef: 'wh-1',
            warehouseNumber: '12',
            warehouseName: 'Відділення №12: вул. Хрещатик, 1',
        },
    },
    items: [
        {
            productId: 'p1',
            name: 'Футболка NU31',
            quantity: 2,
            priceKopecks: 50000,
            sumKopecks: 100000,
        },
    ],
    totalKopecks: 100000,
    userId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('html escaping', () => {
    it('neutralises markup', () => {
        expect(escapeHtml('<script>alert(1)</script>')).toBe(
            '&lt;script&gt;alert(1)&lt;/script&gt;'
        )
    })

    it('escapes quotes and ampersands', () => {
        expect(escapeHtml(`Tom & "Jerry" 'x'`)).toBe(
            'Tom &amp; &quot;Jerry&quot; &#39;x&#39;'
        )
    })

    it('handles an empty value', () => {
        expect(escapeHtml('')).toBe('')
    })
})

describe('order paid email', () => {
    const message = buildOrderPaidEmail(order)

    it('puts the amount in the subject', () => {
        expect(message.subject).toContain('1000 ₴')
    })

    it('greets the buyer and lists the items', () => {
        expect(message.html).toContain('Вова')
        expect(message.html).toContain('Футболка NU31 × 2')
    })

    it('includes the nova poshta branch', () => {
        expect(message.html).toContain('Київ, відділення №12')
    })

    it('includes the order reference', () => {
        expect(message.html).toContain('ref-123')
    })

    // Name, product name and delivery all originate from user input and land
    // inside an HTML body.
    it('escapes customer-supplied values', () => {
        const hostile = buildOrderPaidEmail({
            ...order,
            customer: {
                ...order.customer,
                name: '<img src=x onerror=alert(1)>',
            },
        })

        expect(hostile.html).not.toContain('<img src=x')
        expect(hostile.html).toContain('&lt;img src=x')
    })
})
