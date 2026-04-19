import { describe, expect, it } from 'vitest'
import { hasUserSession, isJwtSessionPayload } from './session-validation'

describe('auth session validation', () => {
    it('accepts a jwt payload with string userId and sessionKey', () => {
        expect(isJwtSessionPayload({ userId: 'user-1', sessionKey: 'session-1' })).toBe(true)
    })

    it('rejects malformed jwt payloads', () => {
        expect(isJwtSessionPayload(null)).toBe(false)
        expect(isJwtSessionPayload({})).toBe(false)
        expect(isJwtSessionPayload({ userId: 1, sessionKey: 'session-1' })).toBe(false)
        expect(isJwtSessionPayload({ userId: 'user-1', sessionKey: 1 })).toBe(false)
    })

    it('finds a matching session in a user document', () => {
        expect(hasUserSession({
            sessions: [
                { sessionKey: 'session-1' },
                { sessionKey: 'session-2' },
            ],
        }, 'session-2')).toBe(true)
    })

    it('rejects users with missing or malformed session lists', () => {
        expect(hasUserSession(null, 'session-1')).toBe(false)
        expect(hasUserSession({}, 'session-1')).toBe(false)
        expect(hasUserSession({ sessions: [null, { sessionKey: 1 }] }, 'session-1')).toBe(false)
    })
})
