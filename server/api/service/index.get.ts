import { defineEventHandler, useNitroApp, useRuntimeConfig } from '#imports'
import { pingDatabase } from '~~/server/core/runtime/database'
import { UserSession } from '~~/server/core/user/user'

export default defineEventHandler(async (event) => {
    const isConnected = await pingDatabase(useNitroApp())
    let commitSha = 'init unknown'

    try {
        commitSha = useRuntimeConfig().public.gitCommitSha || 'dev'
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e)
        useNitroApp().logger.error('Error getting commit sha', {
            error: message,
        })
        commitSha = `Error getting commit sha: ${message}`
    }

    const user = event.context.user as UserSession

    return {
        isConnected: isConnected,
        commitSha: commitSha,
        user: user,
    }
})
