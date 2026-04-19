import { Db, MongoClient } from 'mongodb'
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

        await db.collection('discord_members').createIndex(
            { discordId: 1 },
            {
                unique: true,
                name: 'unique_discord_id'
            }
        )

        await db.collection('discord_members').createIndex(
            { id: 1 },
            {
                unique: true,
                name: 'unique_discord_member_id'
            }
        )

        await db.collection('electricity_trackers').createIndex(
            { slug: 1 },
            {
                unique: true,
                name: 'unique_electricity_tracker_slug'
            }
        )

        await db.collection('electricity_tracker_alive').createIndex(
            { deviceSlug: 1, timestamp: -1 },
            { name: 'deviceSlug_timestamp_desc' }
        )

        const blogPosts = db.collection('blogPosts')
        await blogPosts.createIndex(
            { slug: 1 },
            {
                unique: true,
                name: 'unique_blog_slug'
            }
        )
        await blogPosts.createIndex(
            { status: 1, updatedAt: -1 },
            {
                name: 'status_updatedAt_idx'
            }
        )

        await db.collection('blogPostViews').createIndex(
            { slug: 1, sessionKey: 1 },
            { unique: true, name: 'unique_blog_post_view' }
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
