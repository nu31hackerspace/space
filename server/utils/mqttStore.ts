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

type DynSecCommand = { command: string; [key: string]: any }

type PendingDynSecRequest = {
    commands: DynSecCommand[]
    resolve: (res: any) => void
    reject: (err: any) => void
}

const dynSecQueue: PendingDynSecRequest[] = []
let isProcessingDynSec = false

export function handleDynSecResponse(payload: any) {
    if (dynSecQueue.length === 0) return
    const req = dynSecQueue.shift()
    if (req) {
        req.resolve(payload)
    }
}

function processNextDynSec() {
    if (isProcessingDynSec || dynSecQueue.length === 0 || !mqttClient) return

    isProcessingDynSec = true
    const req = dynSecQueue[0]

    try {
        mqttClient.publish('$CONTROL/dynamic-security/v1', JSON.stringify({ commands: req.commands }))

        setTimeout(() => {
            if (dynSecQueue[0] === req) {
                dynSecQueue.shift()
                req.reject(new Error("DynSec request timed out"))
                isProcessingDynSec = false
                processNextDynSec()
            }
        }, 5000)
    } catch (e) {
        dynSecQueue.shift()
        req.reject(e)
        isProcessingDynSec = false
        processNextDynSec()
    }
}

export function executeDynSecCommands(commands: DynSecCommand[]): Promise<any> {
    return new Promise((resolve, reject) => {
        dynSecQueue.push({
            commands,
            resolve: (res) => {
                isProcessingDynSec = false
                resolve(res)
                processNextDynSec()
            },
            reject: (err) => {
                isProcessingDynSec = false
                reject(err)
                processNextDynSec()
            }
        })
        processNextDynSec()
    })
}
