import { describe, expect, it } from 'vitest'
import { assertPostOwner } from './ownership'

describe('assertPostOwner', () => {
    it('does not throw when user is the owner', () => {
        expect(() =>
            assertPostOwner({ owner_id: 'user:123' }, 'user:123')
        ).not.toThrow()
    })

    it('throws 403 when user is not the owner', () => {
        try {
            assertPostOwner({ owner_id: 'user:123' }, 'user:456')
        } catch (error: any) {
            expect(error.statusCode).toBe(403)
            expect(error.statusMessage).toBe('Forbidden')
            return
        }

        throw new Error('Expected assertPostOwner to throw')
    })

    it('throws 403 when owner_id is missing from the post', () => {
        try {
            assertPostOwner({}, 'user:123')
        } catch (error: any) {
            expect(error.statusCode).toBe(403)
            expect(error.statusMessage).toBe('Forbidden')
            return
        }

        throw new Error('Expected assertPostOwner to throw when owner_id is absent')
    })
})
