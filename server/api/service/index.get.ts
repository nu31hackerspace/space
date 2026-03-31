import { defineEventHandler, useNitroApp, useRuntimeConfig } from '#imports'
import { UserSession } from '~~/server/core/user/user'
import { mqttClient } from '../../utils/mqttStore'

export default defineEventHandler(async (event) => {
    const isConnected: boolean = await useNitroApp()
        .db.command({ ping: 1 })
        .then((_) => true)
        .catch((_) => false)


    const isMqttConnected = mqttClient?.connected ?? false

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

    console.log(user)

    return {
        isConnected: isConnected,
        isMqttConnected: isMqttConnected,
        commitSha: commitSha,
        user: user,
    }
})
