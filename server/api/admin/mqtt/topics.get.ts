import { getActiveTopics } from '../../../utils/mqttStore'
import { defineEventHandler, createError } from '#imports'

export default defineEventHandler((event) => {
    if (!event.context.user) {
        throw createError({ statusCode: 401, message: 'Unauthorized' })
    }
    const topics = getActiveTopics()

    return {
        topics
    }
})
