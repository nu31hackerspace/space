// Pure parsing of Nova Poshta API responses.
//
// Every method answers on HTTP 200 with the same envelope and reports failure
// inside the body, so "did it work" is a parsing question rather than a status
// code one — which is exactly what makes it testable without a network.

import type { DeliveryCity, DeliveryWarehouse } from '~~/shared/types/delivery'

interface NovaPoshtaEnvelope {
    success?: boolean
    data?: unknown
    errors?: unknown
}

export class NovaPoshtaError extends Error {
    constructor(
        message: string,
        readonly errors: string[] = []
    ) {
        super(message)
    }

    // Nova Poshta reports a ref that does not exist the same way it reports its
    // own faults — inside a 200 envelope — so the reported text is the only
    // thing separating "you asked for nothing" from "we are down".
    get isNotFound(): boolean {
        return this.errors.some((error) => /not found/i.test(error))
    }
}

export function parseEnvelope(body: unknown): Record<string, unknown>[] {
    const envelope = body as NovaPoshtaEnvelope | null

    if (!envelope || typeof envelope !== 'object') {
        throw new NovaPoshtaError('Malformed Nova Poshta response')
    }

    if (envelope.success !== true) {
        const errors = Array.isArray(envelope.errors)
            ? envelope.errors.filter((error) => typeof error === 'string')
            : []
        throw new NovaPoshtaError(
            errors.length > 0
                ? errors.join('; ')
                : 'Nova Poshta request was not successful',
            errors
        )
    }

    return Array.isArray(envelope.data)
        ? (envelope.data as Record<string, unknown>[])
        : []
}

function text(value: unknown): string {
    return typeof value === 'string' ? value : ''
}

function toCity(item: Record<string, unknown>): DeliveryCity | null {
    const ref = text(item.Ref)
    const name = text(item.Description)

    if (!ref || !name) {
        return null
    }

    return { ref, name, area: text(item.AreaDescription) }
}

function toWarehouse(item: Record<string, unknown>): DeliveryWarehouse | null {
    const ref = text(item.Ref)
    const name = text(item.Description)

    if (!ref || !name) {
        return null
    }

    return {
        ref,
        number: text(item.Number),
        name,
        category: text(item.CategoryOfWarehouse),
    }
}

export function parseCities(body: unknown): DeliveryCity[] {
    return parseEnvelope(body)
        .map(toCity)
        .filter((city): city is DeliveryCity => city !== null)
}

export function parseWarehouses(body: unknown): DeliveryWarehouse[] {
    return parseEnvelope(body)
        .map(toWarehouse)
        .filter(
            (warehouse): warehouse is DeliveryWarehouse => warehouse !== null
        )
}

// Nova Poshta refs are UUIDs. Checking the shape before spending an API call
// turns an obviously bogus request into a 400 instead of a round trip.
const REF_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidRef(ref: string): boolean {
    return REF_PATTERN.test((ref || '').trim())
}
