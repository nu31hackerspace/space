import { createError, defineEventHandler, useNitroApp } from '#imports'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const db = useNitroApp().db
    const record = await db.collection('users').findOne(
        { id: user.userId },
        { projection: { _id: 0, username: 1 } }
    )

    return { username: record?.username || '' }
})
