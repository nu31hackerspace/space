import { defineEventHandler, useNitroApp } from '#imports'

export default defineEventHandler((event) => {
    const { method, url } = event.node.req
    const start = Date.now()

    event.node.res.on('finish', () => {
        useNitroApp().logger.info('http request', {
            method,
            url,
            status: event.node.res.statusCode,
            duration: Date.now() - start,
        })
    })
})
