// Posts a paid order into the space's Discord channel.
//
// Uses the Discord REST API directly with the bot token, matching how the rest
// of server/core/discord talks to Discord — discord.js is not used server-side
// in this project.

import { useNitroApp, useRuntimeConfig } from '#imports'
import type { MerchOrder } from '~~/shared/types/merch'
import { buildOrderPaidMessage } from './order-message'

// Never throws: the payment already succeeded, and a Discord outage must not
// turn a paid order into a failed webhook that monobank keeps retrying.
export async function sendOrderPaidDiscordMessage(
    order: MerchOrder
): Promise<void> {
    const config = useRuntimeConfig()
    const logger = useNitroApp().logger

    if (!config.orderChannelId || !config.discordBotToken) {
        logger.warn(
            'Discord order channel is not configured — skipping notification'
        )
        return
    }

    try {
        const response = await fetch(
            `https://discord.com/api/v10/channels/${config.orderChannelId}/messages`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bot ${config.discordBotToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: buildOrderPaidMessage(order),
                    // A buyer can put '@everyone' in their name. Without this
                    // the order notification would ping the whole server.
                    allowed_mentions: { parse: [] },
                }),
            }
        )

        if (!response.ok) {
            throw new Error(
                `Discord responded ${response.status}: ${await response.text()}`
            )
        }

        logger.info(`Order ${order.reference} posted to Discord`)
    } catch (error) {
        logger.error(
            `Failed to post order ${order.reference} to Discord:`,
            error
        )
    }
}
