import { useRuntimeConfig } from "#imports"

export function discordRedirectUri() {
    const runtimeConfig = useRuntimeConfig()
    return runtimeConfig.public.baseUrl + '/callback/discord'
}