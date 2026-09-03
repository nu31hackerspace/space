// Pure product logic: turn raw admin-form input into a storable product, and a
// stored document into an API response. No DB, no HTTP — see
// server/api/merch/products/* for those.

import { MAX_PRODUCT_IMAGES, type MerchProduct } from '~~/shared/types/merch'
import { generateSlugFromTitle } from '~~/shared/utils'
import { fail, ok, type ParseResult } from './result'

// 100 000 UAH. A sanity ceiling rather than a business rule: it exists so a
// slipped keystroke in the admin form cannot produce an invoice for an absurd
// amount.
const MAX_PRICE_KOPECKS = 10_000_000
const MAX_NAME_LENGTH = 120
const MAX_DESCRIPTION_LENGTH = 2000

export interface ProductInput {
    name: string
    description: string
    price: string
}

export interface ParsedProduct {
    name: string
    description: string
    priceKopecks: number
}

// The admin form sends the price as free text. Accepts '500', '500.50' and
// '500,50' — a Ukrainian keyboard layout produces a comma decimal separator,
// and rejecting that would just be a trap for whoever fills the form.
export function parsePriceToKopecks(price: string): number | null {
    const normalized = (price || '').trim().replace(',', '.')

    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
        return null
    }

    return Math.round(Number(normalized) * 100)
}

export function parseProductInput(
    input: ProductInput
): ParseResult<ParsedProduct> {
    const name = (input.name || '').trim()
    if (!name) {
        return fail('Name is required')
    }
    if (name.length > MAX_NAME_LENGTH) {
        return fail(`Name must be at most ${MAX_NAME_LENGTH} characters`)
    }

    const description = (input.description || '').trim()
    if (description.length > MAX_DESCRIPTION_LENGTH) {
        return fail(
            `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`
        )
    }

    const priceKopecks = parsePriceToKopecks(input.price)
    if (priceKopecks === null) {
        return fail('Price must be a number with at most 2 decimal places')
    }
    if (priceKopecks <= 0) {
        return fail('Price must be greater than zero')
    }
    if (priceKopecks > MAX_PRICE_KOPECKS) {
        return fail(`Price must be at most ${MAX_PRICE_KOPECKS / 100} UAH`)
    }

    return ok({
        name,
        description,
        priceKopecks,
    })
}

// Mongo document shape for a product. Declared loosely on purpose: the driver
// hands back Document, and narrowing it here keeps the callers honest without
// dragging mongodb types into the pure layer.
// A transliterated name alone collides the moment two products share a name,
// and renaming one would silently steal the other's URL. The suffix makes each
// slug unique on its own, so the readable part never has to be fought over.
export const SLUG_SUFFIX_LENGTH = 6

export function buildProductSlug(name: string, suffix: string): string {
    const base = generateSlugFromTitle(name)

    return `${base}-${suffix}`
}

export interface ProductDocument {
    _id: { toString(): string }
    slug?: string
    name?: string
    description?: string
    priceKopecks?: number
    imageFilenames?: unknown
    isAvailable?: boolean
    createdAt?: Date
}

// The driver returns the stored array untyped, so junk is filtered out rather
// than trusted into the response.
export function normalizeImageFilenames(product: ProductDocument): string[] {
    if (!Array.isArray(product.imageFilenames)) {
        return []
    }

    return product.imageFilenames
        .filter(
            (filename): filename is string =>
                typeof filename === 'string' && filename.length > 0
        )
        .slice(0, MAX_PRODUCT_IMAGES)
}

export function toProductResponse(product: ProductDocument): MerchProduct {
    return {
        id: product._id.toString(),
        slug: product.slug || '',
        name: product.name || '',
        description: product.description || '',
        priceKopecks: product.priceKopecks || 0,
        imageFilenames: normalizeImageFilenames(product),
        isAvailable: product.isAvailable !== false,
        createdAt: (product.createdAt || new Date()).toISOString(),
    }
}
