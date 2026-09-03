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

// Creates all required indexes on startup. createIndex is idempotent — safe to run on every boot.
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
                name: 'unique_user_id',
            }
        )

        await db.collection('discord_members').createIndex(
            { discordId: 1 },
            {
                unique: true,
                name: 'unique_discord_id',
            }
        )

        await db.collection('discord_members').createIndex(
            { id: 1 },
            {
                unique: true,
                name: 'unique_discord_member_id',
            }
        )

        await db.collection('electricity_trackers').createIndex(
            { slug: 1 },
            {
                unique: true,
                name: 'unique_electricity_tracker_slug',
            }
        )

        await db
            .collection('electricity_tracker_alive')
            .createIndex(
                { deviceSlug: 1, timestamp: -1 },
                { name: 'deviceSlug_timestamp_desc' }
            )

        // The order reference is the public handle on an order — it is what the
        // result page looks up and what the payment status writes through, so
        // a duplicate would let one payment settle two orders.
        await db.collection('merchOrders').createIndex(
            { reference: 1 },
            {
                unique: true,
                name: 'unique_merch_order_reference',
            }
        )

        // Sparse: an order exists for a moment before its invoice does, and
        // several such rows must not collide on a null invoiceId.
        await db.collection('merchOrders').createIndex(
            { invoiceId: 1 },
            {
                unique: true,
                sparse: true,
                name: 'unique_merch_order_invoice_id',
            }
        )

        await db
            .collection('merchOrders')
            .createIndex(
                { userId: 1, createdAt: -1 },
                { name: 'merch_order_user_createdAt_desc' }
            )

        await db
            .collection('merchProducts')
            .createIndex(
                { createdAt: -1 },
                { name: 'merch_product_createdAt_desc' }
            )

        await db.collection('merchProducts').createIndex(
            { slug: 1 },
            {
                unique: true,
                name: 'unique_merch_product_slug',
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
