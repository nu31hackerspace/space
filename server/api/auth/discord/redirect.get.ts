import { defineEventHandler, useRuntimeConfig } from '#imports'
import { discordRedirectUri } from '~~/server/core/discord/utils'

export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const discordClientId = runtimeConfig.public.discordClientId

    const redirectUri = new URL('https://discord.com/oauth2/authorize')
    redirectUri.searchParams.set('client_id', discordClientId)
    redirectUri.searchParams.set('response_type', 'code')
    redirectUri.searchParams.set(
        'redirect_uri',
        discordRedirectUri()
    )
    redirectUri.searchParams.set('scope', 'identify')

    return {
        redirectUri: redirectUri.toString(),
    }
})

