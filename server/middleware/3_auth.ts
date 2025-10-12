import { defineEventHandler, deleteCookie, getCookie, useNitroApp, useRuntimeConfig } from '#imports'
import jwt from 'jsonwebtoken'
import { UserSession } from '~~/server/core/user/user'

export default defineEventHandler(async (event) => {
    const jwtToken = getCookie(event, 'jwt') as string

    if (jwtToken) {
        try {
            const decoded = jwt.verify(jwtToken, useRuntimeConfig().jwtSecret) as { sessionKey: string, userId: string }
            const db = useNitroApp().db

            const user = await db.collection('users').findOne({ id: decoded.userId })

            if (!user || !user.sessions || !user.sessions.some((session: any) => session.sessionKey === decoded.sessionKey)) {
                event.context.user = undefined
                return
            }

            const userSession: UserSession = {
                sessionKey: decoded.sessionKey,
                userId: decoded.userId,
            }
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