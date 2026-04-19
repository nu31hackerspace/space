import { describe, it, expect } from 'vitest'
import { generateSlugFromTitle, createSlugFromName } from './utils'

describe('Slug Utils', () => {
    describe('generateSlugFromTitle', () => {
        describe('determinism', () => {
            it('produces the same slug for the same title every time', () => {
                const title = 'Hello World'
                expect(generateSlugFromTitle(title)).toBe(generateSlugFromTitle(title))
            })

            it('produces the same slug for ukrainian title every time', () => {
                const title = 'Що таке хакерспейс?'
                expect(generateSlugFromTitle(title)).toBe(generateSlugFromTitle(title))
            })

            it('does not use Math.random — slug contains no unpredictable segment', () => {
                // If random is used, repeated calls would differ. We call 20 times to be sure.
                const title = 'Stability Check'
                const results = Array.from({ length: 20 }, () => generateSlugFromTitle(title))
                const unique = new Set(results)
                expect(unique.size).toBe(1)
            })
        })

        describe('transliteration', () => {
            it('transliterates ukrainian characters', () => {
                const slug = generateSlugFromTitle('Що таке хакерспейс?')
                expect(slug).toBe('shcho-take-khakerspeys')
            })

            it('transliterates mixed ukrainian and latin text', () => {
                const slug = generateSlugFromTitle('Hello Світ')
                expect(slug).toBe('hello-svit')
            })
        })

        describe('edge cases', () => {
            it('handles standard latin text', () => {
                expect(generateSlugFromTitle('Hello World')).toBe('hello-world')
            })

            it('strips special characters', () => {
                expect(generateSlugFromTitle('Hello @ World!')).toBe('hello-world')
            })

            it('returns a non-empty slug for empty title', () => {
                const slug = generateSlugFromTitle('')
                expect(typeof slug).toBe('string')
                expect(slug.length).toBeGreaterThan(0)
            })

            it('trims leading and trailing hyphens', () => {
                const slug = generateSlugFromTitle('!!!hello!!!')
                expect(slug.startsWith('-')).toBe(false)
                expect(slug.endsWith('-')).toBe(false)
            })

            it('collapses multiple hyphens into one', () => {
                const slug = generateSlugFromTitle('hello   world')
                expect(slug).not.toContain('--')
            })
        })
    })
})
