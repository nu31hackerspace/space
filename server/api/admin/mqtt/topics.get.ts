import { getActiveTopics } from '../../../utils/mqttStore'
import { defineEventHandler } from '#imports'

export default defineEventHandler((event) => {
    const topics = getActiveTopics()

    return {
        topics
    }
})
