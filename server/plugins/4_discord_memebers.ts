import { defineNitroPlugin, useRuntimeConfig } from "#imports";

export default defineNitroPlugin(async (nitroApp) => {
    nitroApp.logger.info('Discord members sync plugin initialized...')
    const discordBotToken = useRuntimeConfig().discordBotToken

    // const guildId = '1212765369484181504'
    // const discordResponce = await fetch(`https://discord.com/api/guilds/${guildId}/members`, {
    //     headers: {
    //         'Authorization': `Bot ${discordBotToken}`,
    //     },
    // })

    // console.log(discordResponce)
    // const discordResponceBody = await discordResponce.json()
    // console.log(discordResponceBody)
})