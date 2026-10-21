import type { Db } from 'mongodb'
import { MongoClient } from 'mongodb'
import { defineNitroPlugin, useRuntimeConfig } from '#imports'

export default defineNitroPlugin(async (nitroApp) => {
    // useRuntimeConfig must be called inside the plugin callback — it is not available at module level.
    const config = useRuntimeConfig()
    const client = new MongoClient(config.mongoUri)

    nitroApp.logger.info('Connecting to MongoDB...')
    try {
        nitroApp.mongo = await client.connect()
        nitroApp.db = nitroApp.mongo.db()
        nitroApp.logger.info('Connected to MongoDB')
    } catch (error) {
        nitroApp.logger.error('Failed to connect to MongoDB:', error)
    }
})

declare module 'nitropack' {
    interface NitroApp {
        mongo: MongoClient
        db: Db
    }
}
