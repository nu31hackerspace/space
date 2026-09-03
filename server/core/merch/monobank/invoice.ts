// Builds the monobank `POST /api/merchant/invoice/create` payload from an
// order. Pure — the network call lives in ./client.ts.

import { MERCH_CCY_UAH, type MerchOrderItem } from '~~/shared/types/merch'

// One hour to pay. Long enough for a card top-up, short enough that abandoned
// invoices expire on their own instead of lingering as `created` forever.
const INVOICE_VALIDITY_SECONDS = 3600

export interface MonobankBasketItem {
    name: string
    qty: number
    sum: number
    code: string
    unit: string
    total: number
}

export interface MonobankInvoiceRequest {
    amount: number
    ccy: number
    merchantPaymInfo: {
        reference: string
        destination: string
        customerEmails: string[]
        basketOrder: MonobankBasketItem[]
    }
    redirectUrl: string
    webHookUrl: string
    validity: number
}

export function joinUrl(baseUrl: string, path: string): string {
    return `${baseUrl.replace(/\/+$/, '')}${path}`
}

export interface BuildInvoiceParams {
    reference: string
    items: MerchOrderItem[]
    totalKopecks: number
    customerEmail: string
    baseUrl: string
}

export function buildInvoiceRequest(
    params: BuildInvoiceParams
): MonobankInvoiceRequest {
    return {
        amount: params.totalKopecks,
        ccy: MERCH_CCY_UAH,
        merchantPaymInfo: {
            reference: params.reference,
            destination: 'Мерч хакерспейсу NU31',
            customerEmails: [params.customerEmail],
            basketOrder: params.items.map((item) => ({
                name: item.name,
                qty: item.quantity,
                sum: item.priceKopecks,
                code: item.productId,
                unit: 'шт.',
                total: item.sumKopecks,
            })),
        },
        redirectUrl: joinUrl(
            params.baseUrl,
            `/merch/result?ref=${encodeURIComponent(params.reference)}`
        ),
        webHookUrl: joinUrl(params.baseUrl, '/api/merch/webhook'),
        validity: INVOICE_VALIDITY_SECONDS,
    }
}
