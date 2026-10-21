import { describe, expect, it } from 'vitest'
import { MERCH_PRODUCTS, findMerchProduct, formatPrice } from './merch'

describe('merch catalog', () => {
    it('finds a product by slug', () => {
        const product = MERCH_PRODUCTS[0]!
        expect(findMerchProduct(product.slug)).toBe(product)
    })

    it('returns null for an unknown slug', () => {
        expect(findMerchProduct('no-such-product')).toBeNull()
    })

    it('has unique slugs', () => {
        const slugs = MERCH_PRODUCTS.map((product) => product.slug)
        expect(new Set(slugs).size).toBe(slugs.length)
    })
})

describe('merch price formatting', () => {
    it('appends the currency sign', () => {
        expect(formatPrice(500)).toBe('500 ₴')
    })
})
