import { defineEventHandler, readBody, createError } from 'h3'
import { KarmaService } from '../../core/discord/karma'

type KarmaGiveRequest = {
    giver_discord_id: string
    receiver_discord_ids: string[]
}

export default defineEventHandler(async (event) => {
    const body = await readBody<KarmaGiveRequest>(event)

    if (!body.giver_discord_id) {
        throw createError({
            statusCode: 400,
            message: 'giver_discord_id is required'
        })
    }

    if (!body.receiver_discord_ids || !Array.isArray(body.receiver_discord_ids) || body.receiver_discord_ids.length === 0) {
        throw createError({
            statusCode: 400,
            message: 'receiver_discord_ids must be a non-empty array'
        })
    }

    try {
        const karmaService = new KarmaService()
        const result = await karmaService.giveKarma(
            body.giver_discord_id,
            body.receiver_discord_ids
        )

        return result

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to give karma'
        throw createError({
            statusCode: 500,
            message: errorMessage
        })
    }
})

