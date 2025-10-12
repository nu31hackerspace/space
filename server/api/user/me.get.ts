import { defineEventHandler, useNitroApp } from '#imports'
import { UserSession } from '~~/server/core/user/user'

export default defineEventHandler(async (event) => {
    const userSession = event.context.user as UserSession | undefined

    if (!userSession) {
        return {
            user: null,
        }
    }

    const db = useNitroApp().db
    const user = await db.collection('users').findOne({ id: userSession.userId })

    if (!user) {
        return {
            user: null,
        }
    }

    return {
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
        },
    }
})

