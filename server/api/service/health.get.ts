import { defineEventHandler, useNitroApp, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
    const isConnected: boolean = await useNitroApp()
        .db.command({ ping: 1 })
        .then((_) => true)
        .catch((_) => false)

    if (!isConnected) {
        event.node.res.statusCode = 503
        return 'unhealthy'
    }

    return 'healthy'
})
