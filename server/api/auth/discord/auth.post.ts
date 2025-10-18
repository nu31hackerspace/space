import { defineEventHandler, getCookie, readBody, setCookie, useNitroApp, useRuntimeConfig } from '#imports'
import { discordAuth } from '~~/server/core/discord/auth'
import { AuthTechnicalInfo, createOrUpdateUser, setUserAvatar, User } from '~~/server/core/user/init'
import { COUNTRY_HEADER_NAME, TRACKING_COOKIE_NAME } from '~~/server/tracking/const'
import jwt from 'jsonwebtoken'
import { FileStoreType } from '~~/server/plugins/3_file_store'
import { discordAvatarUrl } from '~~/server/core/discord/utils'
import { checkIsUserInGuild, getUserByAuthToken, UserInGuildStatus } from '~~/server/core/discord/data/repository'
import { ERROR_USER_NOT_IN_GUILD_CODE } from '~~/shared/types/errors'
import type { AuthResponse } from '~~/shared/types/auth_response'

export default defineEventHandler(async (event): Promise<AuthResponse> => {
    const { code } = await readBody(event)
    const userAgent = event.node.req.headers['user-agent'] as string
    const country = event.node.req.headers[COUNTRY_HEADER_NAME] as string
    const accessToken = await discordAuth(code)

    const userBody: any = await getUserByAuthToken(accessToken)
    useNitroApp().logger.info('Discord user getting successful', { user: userBody })

    const discordUserId = userBody.id
    useNitroApp().logger.info('Discord user ID', { discordUserId: discordUserId })

    const userInGuildStatus = await checkIsUserInGuild(discordUserId)
    if (userInGuildStatus !== UserInGuildStatus.InGuildWithRole) {
        const step1Complete = userInGuildStatus === UserInGuildStatus.InGuildNoRole
        const step2Complete = false

        return {
            success: false,
            errorCode: ERROR_USER_NOT_IN_GUILD_CODE,
            errorMessage: 'User is not in the guild or does not have required role',
            stepStatus: {
                step1Complete,
                step2Complete,
            },
        }
    }

    const name = userBody.global_name
    const userId = 'discord:' + discordUserId
    const username = userBody.username

    const sessionKey = getCookie(event, TRACKING_COOKIE_NAME) as string

    const jwtToken = jwt.sign({ sessionKey: sessionKey, userId: userId }, useRuntimeConfig().jwtSecret, { expiresIn: '1y' })

    const user: User = {
        id: userId,
        name: name,
        username: username,
        avatarId: userBody.avatar,
    }

    const authTechnicalInfo: AuthTechnicalInfo = {
        userAgent: userAgent,
        country: country,
        sessionKey: sessionKey,
    }

    await createOrUpdateUser(user, authTechnicalInfo)

    const fileStore = useNitroApp().fileStores.getFileStore(FileStoreType.UserAvatar)
    const avatarUrl = discordAvatarUrl(discordUserId, user.avatarId)

    if (avatarUrl) {
        const avatarFilename = 'avatar-' + user.id + '.png'
        await fileStore.saveFileByUrl(avatarUrl as string, avatarFilename)
        await setUserAvatar(user, avatarFilename)
    }

    setCookie(event, 'jwt', jwtToken)

    const db = useNitroApp().db
    const createdUser = await db.collection('users').findOne({ id: userId })

    if (!createdUser) {
        useNitroApp().logger.error('User not created in database')
        return {
            success: false,
            errorCode: 500,
            errorMessage: 'User not created',
            stepStatus: {
                step1Complete: true,
                step2Complete: true,
            },
        }
    }

    return {
        success: true,
        user: {
            id: createdUser.id,
            name: createdUser.name,
            username: createdUser.username,
        },
    }
})
