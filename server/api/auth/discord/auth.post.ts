import { createError, defineEventHandler, getCookie, readBody, setCookie, useNitroApp, useRuntimeConfig } from '#imports'
import { discordAuth } from '~~/server/core/discord/auth'
import { AuthTechnicalInfo, createOrUpdateUser, setUserAvatar, User } from '~~/server/core/user/init'
import { COUNTRY_HEADER_NAME, TRACKING_COOKIE_NAME } from '~~/server/tracking/const'
import jwt from 'jsonwebtoken'
import { FileStoreType } from '~~/server/plugins/3_file_store'

export default defineEventHandler(async (event) => {
    const { code } = await readBody(event)
    const userAgent = event.node.req.headers['user-agent'] as string
    const country = event.node.req.headers[COUNTRY_HEADER_NAME] as string
    const accessToken = await discordAuth(code)

    const discordResponce = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    })

    if (!discordResponce.ok) {
        throw createError({
            statusCode: discordResponce.status,
            statusMessage: 'Discord user getting failed',
        })
    }

    const userBody = await discordResponce.json()
    useNitroApp().logger.info('Discord user getting successful', userBody)

    const name = userBody.global_name
    const discordUserId = userBody.id
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
    const avatarUrl = "https://cdn.discordapp.com/avatars/" + discordUserId + "/" + user.avatarId + ".png"
    const avatarFilename = 'avatar-' + discordUserId + '.png'
    await fileStore.saveFileByUrl(avatarUrl, avatarFilename)

    await setUserAvatar(user, avatarFilename)

    setCookie(event, 'jwt', jwtToken)

    const db = useNitroApp().db
    const createdUser = await db.collection('users').findOne({ id: userId })

    if (!createdUser) {
        throw createError({
            statusCode: 500,
            statusMessage: 'User not created',
        })
    }

    return {
        user: {
            id: createdUser.id,
            name: createdUser.name,
            username: createdUser.username,
        },
    }
})
