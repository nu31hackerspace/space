import { type MqttClient } from 'mqtt'

export interface MqttTopicStats {
    topic: string
    messageCount: number
    lastMessageAt: Date
    lastPayloadPreview: string
}

export const activeTopics = new Map<string, MqttTopicStats>()

export let mqttClient: MqttClient | null = null

export function setMqttClient(client: MqttClient | null) {
    mqttClient = client
}

export function getActiveTopics() {
    return Array.from(activeTopics.values()).sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
}
