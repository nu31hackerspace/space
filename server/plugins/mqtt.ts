import { defineNitroPlugin, useRuntimeConfig } from '#imports'
import mqtt from 'mqtt'
import { setMqttClient, activeTopics } from '../utils/mqttStore'

export default defineNitroPlugin((nitroApp) => {
    const config = useRuntimeConfig()

    const host = config.mqttHost
    const username = config.mqttUser
    const password = config.mqttPass

    if (!host) {
        console.warn('MQTT: No host provided, skipping connection')
        return
    }

    console.log(`MQTT: Connecting to broker at ${host}`)

    const client = mqtt.connect(host, {
        username: username,
        password: password,
    })

    setMqttClient(client)

    client.on('connect', () => {
        console.log('MQTT: Connected successfully')

        client.subscribe('#', (err) => {
            if (err) {
                console.error('MQTT: Failed to subscribe to #', err)
            } else {
                console.log('MQTT: Subscribed to # to track active topics')
            }
        })
    })

    client.on('message', (topic, payload) => {
        if (topic.startsWith('$SYS/')) return

        const payloadStr = payload.toString()
        const preview = payloadStr.length > 50 ? payloadStr.slice(0, 50) + '...' : payloadStr

        const stats = activeTopics.get(topic) || {
            topic,
            messageCount: 0,
            lastMessageAt: new Date(),
            lastPayloadPreview: ''
        }

        stats.messageCount++
        stats.lastMessageAt = new Date()
        stats.lastPayloadPreview = preview

        activeTopics.set(topic, stats)

        if (activeTopics.size > 5000) {
            const oldest = Array.from(activeTopics.entries())
                .sort((a, b) => a[1].lastMessageAt.getTime() - b[1].lastMessageAt.getTime())[0]
            if (oldest) {
                activeTopics.delete(oldest[0])
            }
        }
    })

    client.on('error', (err) => {
        console.error('MQTT: Connection error', err)
    })

    nitroApp.hooks.hook('close', () => {
        client.end()
        setMqttClient(null)
    })
})
