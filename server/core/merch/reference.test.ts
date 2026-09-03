import { describe, expect, it } from 'vitest'
import { generateOrderReference, REFERENCE_DIGITS } from './reference'

describe('order reference', () => {
    it('reads as ukrainian adjective-noun-digits', () => {
        expect(generateOrderReference()).toMatch(
            /^[\u0430-\u044f\u0454\u0456\u0457\u0491]+-[\u0430-\u044f\u0454\u0456\u0457\u0491]+-\d{6}$/
        )
    })

    it('always pads the number to six digits', () => {
        // The lowest possible draw must not collapse to '0'.
        const reference = generateOrderReference(() => 0)

        expect(reference.split('-')[2]).toBe('0'.repeat(REFERENCE_DIGITS))
    })

    it('uses the top of each range without overflowing', () => {
        const reference = generateOrderReference((max) => max - 1)
        const digits = reference.split('-')[2]!

        expect(digits).toBe('999999')
        expect(digits).toHaveLength(REFERENCE_DIGITS)
    })

    // Cyrillic is not URL-safe, so every caller that builds a URL from a
    // reference has to encode it — what matters is that it survives the trip.
    it('survives percent-encoding round trip', () => {
        const reference = generateOrderReference()

        expect(decodeURIComponent(encodeURIComponent(reference))).toBe(
            reference
        )
    })

    it('contains nothing that needs escaping beyond the letters themselves', () => {
        expect(generateOrderReference()).not.toMatch(/[\s/?#&=%]/)
    })

    it('varies between calls', () => {
        const references = new Set(
            Array.from({ length: 50 }, () => generateOrderReference())
        )

        expect(references.size).toBeGreaterThan(40)
    })
})
