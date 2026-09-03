import { describe, expect, it } from 'vitest'
import { TtlCache } from './cache'

function clock(start = 1000) {
    const state = { now: start }
    return {
        read: () => state.now,
        advance: (ms: number) => {
            state.now += ms
        },
    }
}

describe('ttl cache', () => {
    it('returns a stored value', () => {
        const cache = new TtlCache<string>(1000)
        cache.set('k', 'v')

        expect(cache.get('k')).toBe('v')
    })

    it('misses on an unknown key', () => {
        expect(new TtlCache<string>(1000).get('k')).toBeUndefined()
    })

    it('expires a value once the ttl has passed', () => {
        const time = clock()
        const cache = new TtlCache<string>(1000, 10, time.read)
        cache.set('k', 'v')

        time.advance(999)
        expect(cache.get('k')).toBe('v')

        time.advance(1)
        expect(cache.get('k')).toBeUndefined()
    })

    it('drops the expired entry rather than keeping it around', () => {
        const time = clock()
        const cache = new TtlCache<string>(1000, 10, time.read)
        cache.set('k', 'v')
        time.advance(2000)
        cache.get('k')

        expect(cache.size).toBe(0)
    })

    it('refreshes the ttl on a rewrite', () => {
        const time = clock()
        const cache = new TtlCache<string>(1000, 10, time.read)
        cache.set('k', 'v')

        time.advance(900)
        cache.set('k', 'v2')

        time.advance(900)
        expect(cache.get('k')).toBe('v2')
    })

    it('evicts the least recently used key when full', () => {
        const cache = new TtlCache<string>(10_000, 2)
        cache.set('a', '1')
        cache.set('b', '2')
        cache.get('a')
        cache.set('c', '3')

        expect(cache.size).toBe(2)
        expect(cache.get('a')).toBe('1')
        expect(cache.get('b')).toBeUndefined()
        expect(cache.get('c')).toBe('3')
    })
})
