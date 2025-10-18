import { defineNitroPlugin, useNitroApp, useRuntimeConfig } from "#imports";
import type { NitroApp } from "nitropack/types";
import { DiscordMember, syncDiscordMembers } from "../core/discord/members";
import { getDiscordGuildMembers, isBotAuthenticated } from "../core/discord/data/repository";

export default defineNitroPlugin(async (nitroApp: NitroApp) => {
    nitroApp.logger.info('Discord members sync plugin initialized...')
    const discordBotToken = useRuntimeConfig().discordBotToken
    const discordGuildId = useRuntimeConfig().public.discordGuildId

    if (!discordBotToken || !discordGuildId) {
        nitroApp.logger.error('Discord bot token or guild id is not configured!')
        return
    }

    nitroApp.logger.info('Verifying Discord bot token...')
    const isAuthenticated = await isBotAuthenticated()
    if (!isAuthenticated) {
        nitroApp.logger.error('Discord bot token is not authenticated!')
        return
    }

    nitroApp.logger.info(`Fetching members for guild ${discordGuildId}...`)
    await fetchDiscordMembers(nitroApp)
})

async function fetchDiscordMembers(nitroApp: NitroApp) {
    const discordMembers = await getDiscordGuildMembers()
    await syncDiscordMembers(discordMembers)
    nitroApp.logger.info(`Successfully synced ${discordMembers.length} Discord guild members`)
}