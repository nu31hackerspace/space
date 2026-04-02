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
    const { username } = body

    if (!username) {
        throw createError({ statusCode: 400, message: 'Missing required field: username' })
    }

    if (username === 'admin') {
         throw createError({ statusCode: 403, message: 'Cannot delete admin user' })
    }

    const rolename = `role-${username}`

    // Instead of querying if the role exists, we can try to delete it directly or ignore role delete errors.
    // Mosquitto won't fail the whole batch if deleteClient succeeds but deleteRole fails,
    // assuming they are sequential and not interdependent.
    const commands = [
        { command: 'deleteClient', username },
        { command: 'deleteRole', rolename }
    ]

    try {
        const res = await executeDynSecCommands(commands)
        
        // We'll ignore `deleteRole` failing just in case there was no custom role
        const clientDeleteRes = res.responses.find((r: any) => r.command === 'deleteClient')
        if (clientDeleteRes && clientDeleteRes.error) {
            throw new Error(clientDeleteRes.error)
        }

        return { success: true, message: 'Client removed successfully' }
    } catch (e: any) {
        console.error('Failed to remove MQTT client:', e)
        throw createError({
            statusCode: 500,
            message: e.message || 'Failed to remove MQTT client'
        })
    }
})
