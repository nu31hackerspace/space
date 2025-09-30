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

        await initializeDatabaseSchema(nitroApp.db, nitroApp.logger)
    } catch (error) {
        nitroApp.logger.error('Failed to connect to MongoDB:', error)
    }
})

async function initializeDatabaseSchema(db: Db, logger: any) {
    try {
        logger.info('Initializing database schema...')

        await createIndexes(db, logger)

        logger.info('Database schema initialized successfully')
    } catch (error) {
        logger.error('Failed to initialize database schema:', error)
    }
}

async function createIndexes(db: Db, logger: any) {
    try {
        logger.info('Creating database indexes...')

        const usersCollection = db.collection('users')

        await usersCollection.createIndex(
            { id: 1 },
            {
                unique: true,
                name: 'unique_user_id'
            }
        )

        logger.info('Database indexes created successfully')
    } catch (error) {
        logger.error('Failed to create database indexes:', error)
    }
}

declare module 'nitropack' {
    interface NitroApp {
        mongo: MongoClient
        db: Db
    }
}
