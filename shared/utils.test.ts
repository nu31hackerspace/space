import { describe, it, expect } from 'vitest'
import { generateSlugFromTitle, createSlugFromName } from './utils'

describe('Slug Utils', () => {
    describe('Transliteration', () => {
        it('should transliterate Ukrainian characters', () => {
            const title = 'Що таке хакерспейс?'
            const slug = generateSlugFromTitle(title)
            // Expect start because of random suffix
            expect(slug.startsWith('shcho-take-khakerspeys')).toBe(true)
        })

        it('should transliterate mixed text', () => {
            const title = 'Hello Світ'
            const slug = generateSlugFromTitle(title)
            expect(slug.startsWith('hello-svit')).toBe(true)
        })
    })

    describe('General Slug Generation', () => {
        it('should handle standard latin text', () => {
            const title = 'Hello World'
            const slug = generateSlugFromTitle(title)
            expect(slug.startsWith('hello-world')).toBe(true)
        })

        it('should handle special characters', () => {
            const title = 'Hello @ World!'
            const slug = generateSlugFromTitle(title)
            expect(slug.startsWith('hello-world')).toBe(true)
        })
    })
})
