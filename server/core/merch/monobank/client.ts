// Thin HTTP client for the monobank acquiring API.
// Everything that can be decided without a network call lives in ./invoice.ts
// and ./signature.ts so it stays unit-testable.

import type { MonobankInvoiceRequest } from './invoice'

const MONOBANK_API_BASE = 'https://api.monobank.ua'

export interface MonobankInvoiceCreated {
    invoiceId: string
    pageUrl: string
}

export interface MonobankInvoiceStatus {
    invoiceId: string
    status: string
    amount: number
    ccy: number
    reference?: string
    errCode?: string
    failureReason?: string
}

interface MonobankError {
    errCode?: string
    errText?: string
}

async function monobankRequest<T>(
    token: string,
    path: string,
    init?: RequestInit
): Promise<T> {
    if (!token) {
        throw new Error('Monobank token is not configured')
    }

    const response = await fetch(`${MONOBANK_API_BASE}${path}`, {
        ...init,
        headers: {
            'X-Token': token,
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
        },
    })

    const text = await response.text()

    if (!response.ok) {
        let message = `Monobank request failed with ${response.status}`
        try {
            const parsed = JSON.parse(text) as MonobankError
            if (parsed.errText) {
                message = `${message}: ${parsed.errText}`
            }
        } catch {
            // Non-JSON error body — the status code alone has to do.
        }
        throw new Error(message)
    }

    return JSON.parse(text) as T
}

export function createInvoice(
    token: string,
    invoice: MonobankInvoiceRequest
): Promise<MonobankInvoiceCreated> {
    return monobankRequest<MonobankInvoiceCreated>(
        token,
        '/api/merchant/invoice/create',
        {
            method: 'POST',
            body: JSON.stringify(invoice),
        }
    )
}

export function getInvoiceStatus(
    token: string,
    invoiceId: string
): Promise<MonobankInvoiceStatus> {
    return monobankRequest<MonobankInvoiceStatus>(
        token,
        `/api/merchant/invoice/status?invoiceId=${encodeURIComponent(invoiceId)}`
    )
}

// The public key is stable, and monobank explicitly asks integrations not to
// fetch it on every webhook. Cached until a verification failure clears it.
let cachedPublicKey: string | null = null

export async function getPublicKey(token: string): Promise<string> {
    if (cachedPublicKey) {
        return cachedPublicKey
    }

    const response = await monobankRequest<{ key: string }>(
        token,
        '/api/merchant/pubkey'
    )

    cachedPublicKey = response.key
    return cachedPublicKey
}

export function resetPublicKeyCache(): void {
    cachedPublicKey = null
}
