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
    const { username, password, topic } = body

    if (!username || !password || !topic) {
        throw createError({ statusCode: 400, message: 'Missing required fields: username, password, topic' })
    }

    // Check if user already exists
    try {
        const checkRes = await executeDynSecCommands([
            { command: 'getClient', username }
        ])
        const error = checkRes.responses[0]?.error
        if (!error && checkRes.responses[0]?.data?.client) {
            throw createError({ statusCode: 409, message: 'Client already exists' })
        }
    } catch (e: any) {
        if (e.statusCode === 409) throw e
        // Ignore "Client not found" error since we want to create it
    }

    const rolename = `role-${username}`

    const commands = [
        { command: 'createClient', username, password },
        { command: 'createRole', rolename },
        { command: 'addRoleACL', rolename, acltype: 'publishClientSend', topic, allow: true },
        { command: 'addRoleACL', rolename, acltype: 'subscribePattern', topic, allow: true },
        { command: 'addClientRole', username, rolename }
    ]

    try {
        const res = await executeDynSecCommands(commands)
        
        // Check for any errors in the responses array
        const errors = res.responses.filter((r: any) => r.error)
        if (errors.length > 0) {
            console.error('DynSec plugin returned error(s):', errors)
            throw new Error(errors[0].error)
        }

        return { success: true, message: 'Client created successfully' }
    } catch (e: any) {
        console.error('Failed to create MQTT client:', e)
        throw createError({
            statusCode: 500,
            message: e.message || 'Failed to create MQTT client'
        })
    }
})
