import { createError, defineEventHandler, readBody, useNitroApp, useRuntimeConfig } from '#imports'
import type { CreateElectricityTrackerRequest } from '~~/shared/types/create_electricity_tracker'
import { createSlugFromName } from '~~/shared/utils'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
    const user = event.context.user
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        })
    }

    const body = await readBody<CreateElectricityTrackerRequest>(event)
    const { name } = body

    const slug = createSlugFromName(name)
    const db = useNitroApp().db

    const trackerJwtToken = jwt.sign({ trackerSlug: slug }, useRuntimeConfig().jwtSecret)

    const doc = {
        name: name.trim(),
        slug: slug,
        createdAt: new Date(),
        userId: user.userId,
    }

    await db.collection('electricity_trackers').insertOne(doc)

    return {
        tracker: {
            name: name.trim(),
            slug: slug,
            trackerJwtToken: trackerJwtToken,
        }
    }
})

