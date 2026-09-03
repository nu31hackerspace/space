import { describe, expect, it } from 'vitest'
import {
    buildProductSlug,
    normalizeImageFilenames,
    parsePriceToKopecks,
    parseProductInput,
    toProductResponse,
} from './product'

describe('merch price parsing', () => {
    it('converts hryvnias to kopecks', () => {
        expect(parsePriceToKopecks('500')).toBe(50000)
        expect(parsePriceToKopecks('500.50')).toBe(50050)
        expect(parsePriceToKopecks('0.05')).toBe(5)
    })

    it('accepts a comma as the decimal separator', () => {
        expect(parsePriceToKopecks('1200,99')).toBe(120099)
    })

    it('rejects prices that are not plain numbers', () => {
        expect(parsePriceToKopecks('')).toBeNull()
        expect(parsePriceToKopecks('abc')).toBeNull()
        expect(parsePriceToKopecks('-10')).toBeNull()
        expect(parsePriceToKopecks('10.999')).toBeNull()
        expect(parsePriceToKopecks('1e3')).toBeNull()
    })
})

describe('merch product input', () => {
    const validInput = {
        name: 'Футболка NU31',
        description: 'Чорна футболка',
        price: '500',
    }

    it('accepts a complete product', () => {
        const result = parseProductInput(validInput)

        expect(result).toEqual({
            ok: true,
            value: {
                name: 'Футболка NU31',
                description: 'Чорна футболка',
                priceKopecks: 50000,
            },
        })
    })

    it('requires a name', () => {
        const result = parseProductInput({ ...validInput, name: '   ' })

        expect(result.ok).toBe(false)
    })

    it('rejects a zero or unparsable price', () => {
        expect(parseProductInput({ ...validInput, price: '0' }).ok).toBe(false)
        expect(parseProductInput({ ...validInput, price: 'free' }).ok).toBe(
            false
        )
    })

    it('rejects a price above the sanity ceiling', () => {
        const result = parseProductInput({ ...validInput, price: '100001' })

        expect(result.ok).toBe(false)
    })
})

describe('merch product response shaping', () => {
    it('fills defaults for a sparse document', () => {
        const response = toProductResponse({ _id: { toString: () => 'p1' } })

        expect(response.id).toBe('p1')
        expect(response.name).toBe('')
        expect(response.isAvailable).toBe(true)
    })

    it('treats an explicit false as unavailable', () => {
        const response = toProductResponse({
            _id: { toString: () => 'p1' },
            isAvailable: false,
        })

        expect(response.isAvailable).toBe(false)
    })
})

describe('product images', () => {
    it('keeps the uploaded order — the first one is the cover', () => {
        expect(
            normalizeImageFilenames({
                _id: { toString: () => 'p1' },
                imageFilenames: ['a.png', 'b.png', 'c.png'],
            })
        ).toEqual(['a.png', 'b.png', 'c.png'])
    })

    it('drops junk entries', () => {
        expect(
            normalizeImageFilenames({
                _id: { toString: () => 'p1' },
                imageFilenames: ['a.png', '', null, 42, 'b.png'],
            })
        ).toEqual(['a.png', 'b.png'])
    })

    it('caps the gallery at fifteen', () => {
        const many = Array.from({ length: 20 }, (_, i) => `img-${i}.png`)

        expect(
            normalizeImageFilenames({
                _id: { toString: () => 'p1' },
                imageFilenames: many,
            })
        ).toHaveLength(15)
    })

    it('is empty when there is no image at all', () => {
        expect(
            normalizeImageFilenames({ _id: { toString: () => 'p1' } })
        ).toEqual([])
    })
})

describe('product slug', () => {
    it('transliterates the name and appends the suffix', () => {
        expect(buildProductSlug('Футболка NU31', 'a1b2c3')).toBe(
            'futbolka-nu31-a1b2c3'
        )
    })

    it('keeps two products with the same name apart', () => {
        expect(buildProductSlug('Худі', 'aaa111')).not.toBe(
            buildProductSlug('Худі', 'bbb222')
        )
    })

    it('stays url safe for a name full of punctuation', () => {
        const slug = buildProductSlug('Худі «Хакерспейс», 100% бавовна!', 'x1')

        expect(slug).toMatch(/^[a-z0-9-]+$/)
        expect(encodeURIComponent(slug)).toBe(slug)
    })

    // generateSlugFromTitle falls back to a timestamp for an empty title, so
    // the slug is still usable rather than a bare '-suffix'.
    it('survives a name that transliterates to nothing', () => {
        const slug = buildProductSlug('«»!!!', 'x1')

        expect(slug.startsWith('-')).toBe(false)
        expect(slug.endsWith('-x1')).toBe(true)
    })
})
