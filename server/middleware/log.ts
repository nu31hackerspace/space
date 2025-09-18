import { defineEventHandler, useNitroApp } from '#imports'

export default defineEventHandler((event) => {
    const { method, url } = event.node.req
    const start = Date.now()

    event.node.res.on('finish', () => {
        const duration = Date.now() - start
        const status = event.node.res.statusCode

        useNitroApp().logger.info('http', {
            method,
            url,
            status,
            duration,
        })

        useNitroApp().db.collection('http-logs').insertOne({
            method,
            url,
            status,
            duration,
        })
    })
})
