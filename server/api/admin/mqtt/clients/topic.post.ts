import { defineEventHandler, readBody, createError } from '#imports'
import { executeDynSecCommands, mqttClient } from '../../../../utils/mqttStore'

export default defineEventHandler(async (event) => {
    if (!event.context.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    if (!mqttClient) {
        throw createError({ statusCode: 503, message: 'MQTT client not connected' })
    }

    const body = await readBody(event)
    const { username, topic } = body

    if (!username || !topic) {
        throw createError({ statusCode: 400, message: 'Missing required fields: username, topic' })
    }

    if (username === 'admin') {
         throw createError({ statusCode: 403, message: 'Cannot modify admin user topics via this API' })
    }

    const rolename = `role-${username}`

    const commands = [
        { command: 'addRoleACL', rolename, acltype: 'publishClientSend', topic, allow: true },
        { command: 'addRoleACL', rolename, acltype: 'subscribePattern', topic, allow: true }
    ]

    try {
        const res = await executeDynSecCommands(commands)
        
        // We only check if the addRoleACL commands failed
        const errors = res.responses.filter((r: any) => r.error)
        if (errors.length > 0) {
            console.error('DynSec plugin returned error(s):', errors)
            throw new Error(errors[0].error)
        }

        return { success: true, message: 'Topic permission added successfully' }
    } catch (e: any) {
        console.error('Failed to add topic permission:', e)
        throw createError({
            statusCode: 500,
            message: e.message || 'Failed to add topic permission'
        })
    }
})
