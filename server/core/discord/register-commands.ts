import { REST, Routes, ApplicationCommandOptionType } from 'discord.js'
import { useNitroApp, useRuntimeConfig } from '#imports'

export async function registerDiscordCommands() {
    const runtimeConfig = useRuntimeConfig()
    const logger = useNitroApp().logger

    const botToken = runtimeConfig.discordBotToken
    const clientId = runtimeConfig.public.discordClientId
    const guildId = runtimeConfig.public.discordGuildId

    if (!botToken) {
        logger.warn('Discord bot token not configured, skipping command registration')
        return
    }

    const commands = [
        {
            name: 'karma',
            description: 'Give karma to users',
            options: [
                {
                    name: 'user1',
                    description: 'First user to give karma',
                    type: ApplicationCommandOptionType.User,
                    required: true,
                },
                {
                    name: 'user2',
                    description: 'Second user to give karma',
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
                {
                    name: 'user3',
                    description: 'Third user to give karma',
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
                {
                    name: 'user4',
                    description: 'Fourth user to give karma',
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
                {
                    name: 'user5',
                    description: 'Fifth user to give karma',
                    type: ApplicationCommandOptionType.User,
                    required: false,
                },
            ],
        },
    ]

    try {
        const rest = new REST().setToken(botToken)

        logger.info(`Started refreshing ${commands.length} application (/) commands.`)

        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        ) as any[]

        logger.info(`Successfully reloaded ${data.length} application (/) commands.`)
    } catch (error) {
        logger.error('Error registering Discord commands:', error)
        throw error
    }
}

