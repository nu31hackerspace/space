import {
    defineEventHandler,
    getCookie,
    readBody,
    setCookie,
    useNitroApp,
    useRuntimeConfig,
} from '#imports'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { assertDevLoginAllowed, buildDevLoginUser } from '~~/server/core/auth/dev-login'
import { requireDatabase } from '~~/server/core/runtime/database'
import { TRACKING_COOKIE_NAME } from '~~/server/tracking/const'

export default defineEventHandler(async (event) => {
    assertDevLoginAllowed(import.meta.prod)

    const db = requireDatabase(useNitroApp())
    const body = await readBody<{ redirectTo?: string }>(event).catch(() => ({}))
    const sessionKey = getCookie(event, TRACKING_COOKIE_NAME) || randomUUID()
    const user = buildDevLoginUser()

    await db.collection('users').updateOne(
        { id: user.id },
        {
            $set: {
                ...user,
                updateAt: new Date(),
            },
            $setOnInsert: {
                createAt: new Date(),
            },
            $addToSet: {
                sessions: {
                    sessionKey,
                    userAgent: event.node.req.headers['user-agent'] || 'dev-login',
                    country: 'DEV',
                    createAt: new Date(),
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                },
            },
        },
        { upsert: true }
    )

    setCookie(event, TRACKING_COOKIE_NAME, sessionKey, {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    })

    const jwtToken = jwt.sign(
        { sessionKey, userId: user.id },
        useRuntimeConfig().jwtSecret,
        { expiresIn: '1y' }
    )

    setCookie(event, 'jwt', jwtToken, {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    })

    return {
        success: true,
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
        },
        redirectTo: body.redirectTo || '/home',
    }
})
