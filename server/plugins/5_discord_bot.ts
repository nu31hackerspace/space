import { defineNitroPlugin, useRuntimeConfig } from '#imports'
import { createDiscordBot, loginDiscordBot } from '../core/discord/bot'
import { registerDiscordCommands } from '../core/discord/register-commands'
import type { Client } from 'discord.js'

export default defineNitroPlugin(async (nitroApp) => {
    const runtimeConfig = useRuntimeConfig()
    const logger = nitroApp.logger

    // Only initialize if bot token is configured
    if (!runtimeConfig.discordBotToken) {
        logger.warn('Discord bot token not configured, skipping bot initialization')
        return
    }

    try {
        logger.info('Initializing Discord bot...')

        const client: Client = createDiscordBot()
        await loginDiscordBot(client)

        nitroApp.discordBot = client

        logger.info('Registering Discord slash commands...')
        await registerDiscordCommands()

        logger.info('Discord bot initialized successfully')

        // Handle graceful shutdown
        nitroApp.hooks.hook('close', async () => {
            logger.info('Shutting down Discord bot...')
            if (client) {
                client.destroy()
            }
        })

    } catch (error) {
        logger.error('Failed to initialize Discord bot:', error)
        // Don't throw - allow server to start even if bot fails
    }
})

// Extend Nitro app type to include Discord bot
declare module 'nitropack' {
    interface NitroApp {
        discordBot?: Client
    }
}

