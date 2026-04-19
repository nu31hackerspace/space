import { describe, expect, it } from 'vitest'
import { isValidTrackingSessionKey } from './const'

describe('tracking session key validation', () => {
    it('accepts UUID-shaped session keys', () => {
        expect(isValidTrackingSessionKey('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    })

    it('rejects malformed session keys', () => {
        expect(isValidTrackingSessionKey('not-a-uuid')).toBe(false)
        expect(isValidTrackingSessionKey('')).toBe(false)
        expect(isValidTrackingSessionKey(undefined)).toBe(false)
    })
})
