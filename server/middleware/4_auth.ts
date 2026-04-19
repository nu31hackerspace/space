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
