import { defineEventHandler, useNitroApp, useRuntimeConfig } from "#imports"

export default defineEventHandler(async (event) => {
    const isConnected: boolean = await useNitroApp().db.command({ ping: 1 }).then(_ => true).catch(_ => false)
    let commitSha = 'init unknown'

    try {
        commitSha = useRuntimeConfig().public.gitCommitSha || 'dev'
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e)
        useNitroApp().logger.error('Error getting commit sha', { error: message })
        commitSha = `Error getting commit sha: ${message}`
    } 

    return {
        isConnected: isConnected,
        commitSha: commitSha,
    }
})
