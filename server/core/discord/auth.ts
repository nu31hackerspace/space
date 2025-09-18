import { useNitroApp, useRuntimeConfig } from "#imports"
import { discordRedirectUri } from "./utils"

export async function discordAuth(code: string) {
    const runtimeConfig = useRuntimeConfig()

    const redirectUri = discordRedirectUri()

    const request = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirectUri,
    }

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    const response = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        headers: {
            ...headers,
            'Authorization': 'Basic ' + Buffer.from(
                `${runtimeConfig.public.discordClientId}:${runtimeConfig.discordClientSecret}`
            ).toString('base64')
        },
        body: new URLSearchParams(request).toString(),
    })

    const body = await response.json()

    useNitroApp().logger.info('Discord token getting successful')

    const accessToken = body.access_token

    return accessToken
}