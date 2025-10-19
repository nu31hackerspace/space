import { createError, useNitroApp, useRuntimeConfig } from "#imports"
import { DiscordMember } from "../members"

const logger = (() => useNitroApp().logger)

export async function isBotAuthenticated(): Promise<boolean> {
    const discordBotToken = useRuntimeConfig().discordBotToken

    const botInfoResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
            'Authorization': `Bot ${discordBotToken}`,
        },
    })

    if (!botInfoResponse.ok) {
        const errorBody = await botInfoResponse.json()
        logger().error('Invalid Discord bot token:', errorBody)
        return false
    }

    const botInfo = await botInfoResponse.json()
    logger().info(`Bot authenticated as: ${botInfo.username}#${botInfo.discriminator} (ID: ${botInfo.id})`)
    return true
}

export async function getDiscordGuildMembers(): Promise<DiscordMember[]> {
    const discordBotToken = useRuntimeConfig().discordBotToken
    const discordGuildId = useRuntimeConfig().public.discordGuildId
    const discordGuildMemberRoleId = useRuntimeConfig().public.discordGuildMemberRoleId

    const discordResponce = await fetch(`https://discord.com/api/guilds/${discordGuildId}/members?limit=1000`, {
        headers: {
            'Authorization': `Bot ${discordBotToken}`,
        },
    })

    if (!discordResponce.ok) {
        const errorBody = await discordResponce.json()
        logger().error('Failed to fetch Discord guild members:', {
            status: discordResponce.status,
            statusText: discordResponce.statusText,
            error: errorBody,
            hint: 'Make sure the bot is added to the guild and has SERVER MEMBERS INTENT enabled in Discord Developer Portal'
        })
        throw new Error('Failed to fetch Discord guild members')
    }

    const members = await discordResponce.json()

    const discordMembers: DiscordMember[] = members
        .filter((member: any) =>
            member.roles.includes(discordGuildMemberRoleId) &&
            !member.user.bot
        )
        .map((member: any) => ({
            discordId: member.user.id,
            username: member.user.username,
            avatarId: member.user.avatar || null,
        }))

    return discordMembers
}

export async function getUserByAuthToken(authToken: string): Promise<DiscordMember | null> {
    const discordResponce = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    })

    if (!discordResponce.ok) {
        useNitroApp().logger.error('Discord user getting failed', {
            error: discordResponce.statusText,
            hint: 'Make sure the bot is added to the guild and has SERVER MEMBERS INTENT enabled in Discord Developer Portal'
        })
        throw createError({
            statusCode: discordResponce.status,
            statusMessage: 'Discord user getting failed',
        })
    }

    const userBody = await discordResponce.json()
    useNitroApp().logger.info('Discord user by auth token getting successful', { user: userBody })
    return userBody
}

export enum UserInGuildStatus {
    NotInGuild = 'NotInGuild',
    InGuildNoRole = 'InGuildNoRole',
    InGuildWithRole = 'InGuildWithRole'
}

export async function checkIsUserInGuild(discordUserId: string): Promise<UserInGuildStatus> {
    const discordBotToken = useRuntimeConfig().discordBotToken
    const discordGuildId = useRuntimeConfig().public.discordGuildId
    const discordGuildMemberRoleId = useRuntimeConfig().public.discordGuildMemberRoleId

    const discordResponce = await fetch(`https://discord.com/api/guilds/${discordGuildId}/members/${discordUserId}`, {
        headers: {
            'Authorization': `Bot ${discordBotToken}`,
        },
    })

    if (!discordResponce.ok) {
        return UserInGuildStatus.NotInGuild
    }

    const discordResponceBody = await discordResponce.json()

    const isUserInGuild = discordResponceBody.roles.includes(discordGuildMemberRoleId)
    if (!isUserInGuild) {
        return UserInGuildStatus.InGuildNoRole
    }

    return UserInGuildStatus.InGuildWithRole
}