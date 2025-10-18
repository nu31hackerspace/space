import { useNitroApp, useRuntimeConfig } from "#imports"

export function discordRedirectUri() {
    const runtimeConfig = useRuntimeConfig()
    return runtimeConfig.public.baseUrl + '/callback/discord'
}

export function discordAvatarUrl(discordUserId: string, avatarId: string | null): string | null {
    useNitroApp().logger.info('Discord avatar URL', { discordUserId: discordUserId, avatarId: avatarId })
    if (!avatarId) {
        return null
    }
    const avatarUrl = "https://cdn.discordapp.com/avatars/" + discordUserId + "/" + avatarId + ".png"
    useNitroApp().logger.info('avatar URL', { avatarUrl: avatarUrl })
    return avatarUrl
}