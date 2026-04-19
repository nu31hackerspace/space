import type { UserSession } from '~~/server/core/user/user'

type JwtSessionPayload = UserSession

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

// JWT verification returns unknown runtime data, so auth middleware narrows it
// before trusting user/session identifiers from the token.
export function isJwtSessionPayload(value: unknown): value is JwtSessionPayload {
    return isRecord(value)
        && typeof value.userId === 'string'
        && typeof value.sessionKey === 'string'
}

function isSessionRecord(value: unknown): value is { sessionKey: string } {
    return isRecord(value) && typeof value.sessionKey === 'string'
}

// User documents come from Mongo without a strict runtime schema, so session
// membership checks must tolerate missing or malformed session arrays.
export function hasUserSession(user: unknown, sessionKey: string): boolean {
    if (!isRecord(user) || !Array.isArray(user.sessions)) {
        return false
    }

    return user.sessions.some(session => isSessionRecord(session) && session.sessionKey === sessionKey)
}
