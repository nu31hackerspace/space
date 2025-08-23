import { Db, MongoClient } from 'mongodb'
import { defineNitroPlugin, useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()
const uri = config.mongoUri
const client = new MongoClient(uri)

export default defineNitroPlugin(async (nitroApp) => {
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