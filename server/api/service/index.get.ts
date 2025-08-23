import { defineEventHandler, useNitroApp } from "#imports"

export default defineEventHandler(async (event) => {
    const isConnected: boolean = await useNitroApp().db.command({ ping: 1 }).then(_ => true).catch(_ => false)
    return {
        isConnected: isConnected
    }
})
