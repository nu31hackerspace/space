import { defineEventHandler, useNitroApp } from '#imports'
import { mqttClient } from '../../utils/mqttStore'

export default defineEventHandler(async (event) => {
    const isDbConnected: boolean = await useNitroApp()
        .db.command({ ping: 1 })
        .then((_) => true)
        .catch((_) => false)

    const isMqttConnected = mqttClient?.connected ?? false

    if (!isDbConnected || !isMqttConnected) {
        event.node.res.statusCode = 503
        return {
            status: 'unhealthy',
            db: isDbConnected,
            mqtt: isMqttConnected
        }
    }

    return {
        status: 'healthy',
        db: true,
        mqtt: true
    }
})
