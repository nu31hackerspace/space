import { describe, expect, it } from 'vitest'
import { readingTime } from './reading-time'

describe('readingTime', () => {
    it('returns 1 for an empty block list', () => {
        expect(readingTime([])).toBe(1)
    })

    it('counts words in text blocks', () => {
        // 200 words → 1 minute
        const words = Array.from({ length: 200 }, (_, i) => `word${i}`).join(' ')
        expect(readingTime([{ type: 'text', content: words }])).toBe(1)
    })

    it('counts words in header blocks', () => {
        // 400 words across two blocks → 2 minutes
        const words = Array.from({ length: 200 }, (_, i) => `word${i}`).join(' ')
        expect(readingTime([
            { type: 'header', title: words, size: '1' },
            { type: 'text', content: words },
        ])).toBe(2)
    })

    it('counts words in list items', () => {
        // 3 items × 100 words = 300 words → 2 minutes
        const words = Array.from({ length: 100 }, (_, i) => `w${i}`).join(' ')
        expect(readingTime([{ type: 'list', items: [words, words, words], ordered: false }])).toBe(2)
    })

    it('counts words in quote blocks', () => {
        const words = Array.from({ length: 200 }, (_, i) => `w${i}`).join(' ')
        expect(readingTime([{ type: 'quote', content: words }])).toBe(1)
    })

    it('rounds up to the nearest minute', () => {
        // 201 words → ceil(201/200) = 2
        const words = Array.from({ length: 201 }, (_, i) => `word${i}`).join(' ')
        expect(readingTime([{ type: 'text', content: words }])).toBe(2)
    })

    it('ignores image and link blocks (no word count contribution)', () => {
        expect(readingTime([
            { type: 'image', imageUrl: '/img.png' },
            { type: 'link', linkUrl: '/page', linkText: 'Visit page' },
        ])).toBe(1)
    })
})
