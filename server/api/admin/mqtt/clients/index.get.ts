import { defineEventHandler, createError } from '#imports'
import { executeDynSecCommands, mqttClient } from '../../../../utils/mqttStore'

export default defineEventHandler(async (event) => {
    if (!mqttClient) {
        throw new Error('MQTT client not connected')
    }

    try {
        const listRes = await executeDynSecCommands([
            { command: "listClients" },
            { command: "listRoles" }
        ])

        const clientsPayload = listRes.responses[0]?.data?.clients || []
        const rolesPayload = listRes.responses[1]?.data?.roles || []

        if (!clientsPayload.length) {
            return { users: [] }
        }

        const clientCommands = clientsPayload.map((c: any) => ({ command: "getClient", username: c.username || c }))
        const roleCommands = rolesPayload.map((r: any) => ({ command: "getRole", rolename: r.rolename || r }))

        const detailsRes = await executeDynSecCommands([
            ...clientCommands,
            ...roleCommands
        ])

        const clientsDet = detailsRes.responses.slice(0, clientCommands.length)
        const rolesDet = detailsRes.responses.slice(clientCommands.length)

        const roleMap = new Map()
        rolesDet.forEach((r: any) => {
            if (r.data?.role) {
                roleMap.set(r.data.role.rolename, r.data.role)
            }
        })

        const users = clientsDet.map((c: any) => {
            const clientInfo = c.data?.client
            if (!clientInfo) return null

            const userRoles = clientInfo.roles || []
            const acls: any[] = []

            userRoles.forEach((ur: any) => {
                const roleDef = roleMap.get(ur.rolename)
                if (roleDef && roleDef.acls) {
                    acls.push(...roleDef.acls)
                }
            })

            return {
                username: clientInfo.username,
                roles: userRoles.map((r: any) => r.rolename),
                acls: acls
            }
        }).filter(Boolean)

        return { users }
    } catch (e: any) {
        console.error('DynSec error:', e)
        throw createError({
            statusCode: 500,
            message: e.message || 'Failed to communicate with Dynamic Security plugin'
        })
    }
})
