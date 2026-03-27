import { defineEventHandler, useNitroApp } from '#imports'
import { pingDatabase, requireDatabase } from '~~/server/core/runtime/database'

export default defineEventHandler((event) => {
    const { method, url } = event.node.req
    const start = Date.now()

    event.node.res.on('finish', () => {
        pingDatabase(useNitroApp()).then((isReady) => {
            if (!isReady) {
                return
            }

            const db = requireDatabase(useNitroApp())
            const duration = Date.now() - start
            const status = event.node.res.statusCode

            db.collection('http-logs').insertOne({
                method,
                url,
                status,
                duration,
                time: new Date(),
            }).catch(() => {})
        }).catch(() => {})
    })
})
