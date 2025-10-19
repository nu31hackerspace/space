import { defineEventHandler, createError } from 'h3'
import { UserSession } from '~~/server/core/user/user'
import { KarmaService } from '../../core/discord/karma'

export default defineEventHandler(async (event) => {
    const userSession = event.context.user as UserSession | undefined
    if (!userSession) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        })
    }

    try {
        const karmaService = new KarmaService()
        return await karmaService.getAllMembersWithKarma()
    } catch (error) {
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch member karma list'
        })
    }
})

