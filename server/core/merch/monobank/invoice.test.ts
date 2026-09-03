import { describe, expect, it } from 'vitest'
import type { MerchOrderItem } from '~~/shared/types/merch'
import { buildInvoiceRequest, joinUrl } from './invoice'

const items: MerchOrderItem[] = [
    {
        productId: 'p1',
        name: 'Футболка NU31',
        quantity: 2,
        priceKopecks: 50000,
        sumKopecks: 100000,
    },
]

describe('url joining', () => {
    it('does not double the slash', () => {
        expect(joinUrl('https://nu31.space/', '/merch')).toBe(
            'https://nu31.space/merch'
        )
        expect(joinUrl('https://nu31.space', '/merch')).toBe(
            'https://nu31.space/merch'
        )
    })
})

describe('monobank invoice request', () => {
    const request = buildInvoiceRequest({
        reference: 'ref-123',
        items,
        totalKopecks: 100000,
        customerEmail: 'vova@example.com',
        baseUrl: 'http://localhost:3000',
    })

    it('sends the total in kopecks and UAH as the currency', () => {
        expect(request.amount).toBe(100000)
        expect(request.ccy).toBe(980)
    })

    it('points the redirect at the result page for this reference', () => {
        expect(request.redirectUrl).toBe(
            'http://localhost:3000/merch/result?ref=ref-123'
        )
    })

    it('points the webhook at our handler', () => {
        expect(request.webHookUrl).toBe(
            'http://localhost:3000/api/merch/webhook'
        )
    })

    it('builds a basket line per item with a per-unit and total sum', () => {
        expect(request.merchantPaymInfo.basketOrder).toEqual([
            {
                name: 'Футболка NU31',
                qty: 2,
                sum: 50000,
                code: 'p1',
                unit: 'шт.',
                total: 100000,
            },
        ])
    })

    it('carries the reference monobank echoes back on the webhook', () => {
        expect(request.merchantPaymInfo.reference).toBe('ref-123')
    })

    it('escapes a reference that would break the query string', () => {
        const escaped = buildInvoiceRequest({
            reference: 'a&b=c',
            items,
            totalKopecks: 100000,
            customerEmail: 'vova@example.com',
            baseUrl: 'http://localhost:3000',
        })

        expect(escaped.redirectUrl).toBe(
            'http://localhost:3000/merch/result?ref=a%26b%3Dc'
        )
    })
})
