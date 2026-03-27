import { describe, expect, it } from 'vitest'
import { assertDevLoginAllowed, buildDevLoginUser } from './dev-login'

describe('dev login helpers', () => {
    it('builds a stable local admin user', () => {
        expect(buildDevLoginUser()).toEqual({
            id: 'dev:local-admin',
            name: 'Local Admin',
            username: 'dev-admin',
            avatarId: '',
        })
    })

    it('allows dev login outside production', () => {
        expect(() => assertDevLoginAllowed(false)).not.toThrow()
    })

    it('blocks dev login in production', () => {
        try {
            assertDevLoginAllowed(true)
        } catch (error: any) {
            expect(error.statusCode).toBe(404)
            expect(error.statusMessage).toBe('Not Found')
            return
        }

        throw new Error('Expected assertDevLoginAllowed to throw')
    })
})
