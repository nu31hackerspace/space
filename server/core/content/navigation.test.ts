import { describe, expect, it } from 'vitest'
import { pickNavPost } from './navigation'

describe('pickNavPost', () => {
    it('returns null when no post is provided', () => {
        expect(pickNavPost(null)).toBeNull()
    })

    it('returns null when undefined is provided', () => {
        expect(pickNavPost(undefined)).toBeNull()
    })

    it('returns slug and title from a post object', () => {
        expect(pickNavPost({ slug: 'foo', title: 'Foo Post' })).toEqual({
            slug: 'foo',
            title: 'Foo Post',
        })
    })

    it('returns empty title string when title is missing', () => {
        expect(pickNavPost({ slug: 'bar' })).toEqual({ slug: 'bar', title: '' })
    })
})
