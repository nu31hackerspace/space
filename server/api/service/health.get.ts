import { defineEventHandler, useNitroApp } from '#imports'
import { pingDatabase } from '~~/server/core/runtime/database'

export default defineEventHandler(async (event) => {
    const isConnected = await pingDatabase(useNitroApp())

    if (!isConnected) {
        event.node.res.statusCode = 503
        return 'unhealthy'
    }

    return 'healthy'
})
