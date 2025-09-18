import { defineEventHandler, readBody, useNitroApp, useRuntimeConfig } from '#imports'
import { discordAuth } from '~~/server/core/discord/auth'
import { createOrUpdateUser } from '~~/server/core/user/init'

export default defineEventHandler(async (event) => {
    const { code } = await readBody(event)
    const accessToken = await discordAuth(code)

    const user = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    })
    const userBody = await user.json()
    useNitroApp().logger.info('Discord user getting successful', userBody)

    const name = userBody.global_name
    const discordUserId = userBody.id
    const username = userBody.username

    await createOrUpdateUser(discordUserId, name, username)

    return {
        message: 'Authorization successful',
    }
})
