import { Client, GatewayIntentBits, Events, ChatInputCommandInteraction } from 'discord.js'
import { useNitroApp, useRuntimeConfig } from '#imports'
import { KarmaService } from './karma'

export function createDiscordBot() {
    const logger = useNitroApp().logger

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
        ]
    })

    client.once(Events.ClientReady, (readyClient) => {
        logger.info(`Discord bot ready! Logged in as ${readyClient.user.tag}`)
    })

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return

        if (interaction.commandName === 'karma') {
            await handleKarmaCommand(interaction)
        }
    })

    return client
}

async function handleKarmaCommand(interaction: ChatInputCommandInteraction) {
    const logger = useNitroApp().logger

    try {
        // Get the user who invoked the command
        const giver = interaction.user

        // Get all mentioned users from the command
        const users = interaction.options.resolved?.users

        if (!users || users.size === 0) {
            await interaction.reply({
                content: '❌ Please mention at least one user to give karma!',
                ephemeral: true
            })
            return
        }

        // Extract user IDs
        const receiverIds = Array.from(users.values()).map(user => user.id)

        // Defer reply for longer processing
        await interaction.deferReply()

        // Call karma service directly
        const karmaService = new KarmaService()
        const result = await karmaService.giveKarma(giver.id, receiverIds)

        // Format success message
        const userMentions = Array.from(users.values())
            .map(user => `<@${user.id}>`)
            .join(', ')

        const karmaDetails = result.karma_counts
            .map(kc => `<@${kc.receiver_discord_id}>: **${kc.total_karma}** karma`)
            .join('\n')

        await interaction.editReply({
            content: `✅ Karma given to ${userMentions}!\n\n${karmaDetails}`
        })

        logger.info(`Karma given by ${giver.id} to ${receiverIds.join(', ')}`)

    } catch (error) {
        logger.error('Error handling karma command:', error)

        const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request.'
        const userFriendlyMessage = `❌ ${errorMessage}`

        if (interaction.deferred) {
            await interaction.editReply({
                content: userFriendlyMessage
            })
        } else {
            await interaction.reply({
                content: userFriendlyMessage,
                ephemeral: true
            })
        }
    }
}

export async function loginDiscordBot(client: Client) {
    const runtimeConfig = useRuntimeConfig()
    const botToken = runtimeConfig.discordBotToken

    if (!botToken) {
        throw new Error('Discord bot token not configured')
    }

    await client.login(botToken)
}

