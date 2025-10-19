import { Client, GatewayIntentBits, Events, ChatInputCommandInteraction, MessageFlags } from 'discord.js'
import { useNitroApp, useRuntimeConfig } from '#imports'
import { KarmaService } from './karma'

export function createDiscordBot() {
    const logger = useNitroApp().logger
    const runtimeConfig = useRuntimeConfig()
    const allowedGuildId = runtimeConfig.public.discordGuildId

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
        ]
    })

    client.once(Events.ClientReady, (readyClient) => {
        logger.info(`Discord bot ready! Logged in as ${readyClient.user.tag}`)
        logger.info(`Bot will only respond to commands from guild: ${allowedGuildId}`)
    })

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return

        if (interaction.guildId !== allowedGuildId) {
            logger.warn(`Ignored command from unauthorized guild: ${interaction.guildId}`)
            await interaction.reply({
                content: '❌ This bot is not configured for this server.',
                flags: MessageFlags.Ephemeral
            }).catch(() => { })
            return
        }

        if (interaction.commandName === 'karma') {
            await handleKarmaCommand(interaction)
        }
    })

    return client
}

async function handleKarmaCommand(interaction: ChatInputCommandInteraction) {
    const logger = useNitroApp().logger

    try {
        await interaction.deferReply()

        const giver = interaction.user

        const receiverUser = interaction.options.getUser('user', true)

        const reason = interaction.options.getString('reason', false) || undefined

        logger.info('Karma command received:', { giver: giver.id, receiver: receiverUser.id, reason: reason || 'No reason provided' })

        if (!receiverUser) {
            await interaction.editReply({
                content: '❌ Please mention a user to give karma!'
            })
            return
        }

        const karmaService = new KarmaService()
        const result = await karmaService.giveKarma(giver.id, receiverUser.id, reason)

        let message = `✅ Karma given to <@${receiverUser.id}>!\n\n<@${receiverUser.id}>: **${result.total_karma}** karma`

        if (reason) {
            message += `\n\n💬 Reason: ${reason}`
        }

        await interaction.editReply({
            content: message
        })

        logger.info(`Karma given by ${giver.id} to ${receiverUser.id}${reason ? ` with reason: ${reason}` : ''}`)

    } catch (error) {
        logger.info('Error handling karma:', error)

        const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request.'
        const userFriendlyMessage = `❌ ${errorMessage}`

        if (interaction.deferred) {
            await interaction.editReply({
                content: userFriendlyMessage
            })
        } else {
            await interaction.reply({
                content: userFriendlyMessage,
                flags: MessageFlags.Ephemeral
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

