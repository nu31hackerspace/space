// Authentication middleware — runs on every request after session-key setup (prefix 4_).
// Verifies the JWT cookie, checks that the session is still active in the DB,
// and attaches a UserSession to event.context.user so route handlers can check auth without
// repeating token validation. Removes the cookie on tampered or expired tokens.
import { defineEventHandler, deleteCookie, getCookie, useNitroApp, useRuntimeConfig } from '#imports'
import jwt from 'jsonwebtoken'
import { UserSession } from '~~/server/core/user/user'
import { hasUserSession, isJwtSessionPayload } from '~~/server/core/auth/session-validation'

export default defineEventHandler(async (event) => {
    const jwtToken = getCookie(event, 'jwt') as string

    if (jwtToken) {
        try {
            const decoded = jwt.verify(jwtToken, useRuntimeConfig().jwtSecret)
            if (!isJwtSessionPayload(decoded)) {
                event.context.user = undefined
                return
            }

            const db = useNitroApp().db

            const user = await db.collection('users').findOne({ id: decoded.userId })

            if (!hasUserSession(user, decoded.sessionKey)) {
                event.context.user = undefined
                return
            }

            const userSession: UserSession = {
                sessionKey: decoded.sessionKey,
                userId: decoded.userId,
            }

            db.collection('users').updateOne({ id: decoded.userId }, { $set: { lastActivity: new Date() } })

            event.context.user = userSession
        } catch (e) {
            deleteCookie(event, 'jwt')
            event.context.user = undefined
        }
    }
})


declare module '#imports' {
    interface H3EventContext {
        user?: UserSession
    }
}
