import { defineEventHandler, deleteCookie, useNitroApp } from '#imports'
import { UserSession } from '~~/server/core/user/user'

export default defineEventHandler(async (event) => {
    const userSession = event.context.user as UserSession | undefined

    if (!userSession) {
        return {
            success: false,
            message: 'No active session found'
        }
    }

    const db = useNitroApp().db

    await db.collection('users').updateOne(
        { id: userSession.userId },
        {
            $pull: {
                sessions: { sessionKey: userSession.sessionKey }
            } as any
        }
    )

    deleteCookie(event, 'jwt')

    return {
        success: true,
        message: 'Logged out successfully'
    }
})

