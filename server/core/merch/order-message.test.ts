import { describe, expect, it } from 'vitest'
import type { MerchOrder } from '~~/shared/types/merch'
import { buildOrderPaidMessage, escapeDiscordMarkdown } from './order-message'

const order: MerchOrder = {
    id: 'o1',
    reference: 'bold-tesla-482913',
    status: 'paid',
    customer: {
        name: 'Вова',
        email: 'vova@example.com',
        phone: '+380671234567',
        delivery: {
            cityRef: 'c1',
            cityName: 'Київ',
            warehouseRef: 'w1',
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

describe('discord markdown escaping', () => {
    it('escapes the formatting characters', () => {
        expect(escapeDiscordMarkdown('**bold** _x_ `code`')).toBe(
            '\\*\\*bold\\*\\* \\_x\\_ \\`code\\`'
        )
    })

    it('leaves ordinary text alone', () => {
        expect(escapeDiscordMarkdown('Футболка NU31')).toBe('Футболка NU31')
    })

    it('handles an empty value', () => {
        expect(escapeDiscordMarkdown('')).toBe('')
    })
})

describe('order paid discord message', () => {
    const message = buildOrderPaidMessage(order)

    it('leads with the total', () => {
        expect(message).toContain('Нове замовлення')
        expect(message).toContain('1000 ₴')
    })

    it('lists each item with its quantity', () => {
        expect(message).toContain('• Футболка NU31 × 2 — 1000 ₴')
    })

    // Name and phone are what a Nova Poshta waybill needs.
    it('carries the details needed to ship the parcel', () => {
        expect(message).toContain('Отримувач: Вова, +380671234567')
        expect(message).toContain('Доставка: Київ, відділення №12')
    })

    it('does not leak the buyer email into the channel', () => {
        expect(message).not.toContain('vova@example.com')
    })

    it('includes the reference so it can be found in the admin', () => {
        expect(message).toContain('bold-tesla-482913')
    })

    it('escapes a customer name that would rewrite the layout', () => {
        const hostile = buildOrderPaidMessage({
            ...order,
            customer: { ...order.customer, name: '**@everyone**' },
        })

        expect(hostile).toContain('\\*\\*@everyone\\*\\*')
        expect(hostile).not.toContain('**@everyone**')
    })
})
