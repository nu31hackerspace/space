import { useNitroApp } from '#imports'
import { Db } from 'mongodb'

export type KarmaCount = {
    receiver_discord_id: string
    total_karma: number
}

export type GiveKarmaResult = {
    success: boolean
    karma_counts: KarmaCount[]
    timestamp: string
}

export class KarmaService {
    private db: Db
    private logger: any

    constructor() {
        this.db = useNitroApp().db
        this.logger = useNitroApp().logger
    }

    /**
     * Give karma from one user to multiple receivers
     * @param giverDiscordId - Discord ID of the user giving karma
     * @param receiverDiscordIds - Array of Discord IDs receiving karma
     * @returns Result containing karma counts for each receiver
     * @throws Error if validation fails or database operation fails
     */
    async giveKarma(
        giverDiscordId: string,
        receiverDiscordIds: string[]
    ): Promise<GiveKarmaResult> {
        // Validate inputs
        if (!giverDiscordId) {
            throw new Error('giver_discord_id is required')
        }

        if (!receiverDiscordIds || !Array.isArray(receiverDiscordIds) || receiverDiscordIds.length === 0) {
            throw new Error('receiver_discord_ids must be a non-empty array')
        }

        if (receiverDiscordIds.includes(giverDiscordId)) {
            throw new Error('Хтось пробує сам собі дати карму!')
        }

        try {
            const timestamp = new Date()
            const karmaCounts: KarmaCount[] = []

            this.logger.info('Giving karma to receivers:', { giverDiscordId: giverDiscordId, receiverDiscordIds: receiverDiscordIds })

            // Check if receivers exist in discord_members collection
            const existingMembers = await this.db.collection('discord_members').find({
                discordId: { $in: receiverDiscordIds }
            }).project({ discordId: 1 }).toArray()

            const existingIds = new Set(existingMembers.map((m: any) => m.discordId))
            const filteredDiscordIds = receiverDiscordIds.filter(id => existingIds.has(id))

            if (filteredDiscordIds.length === 0) {
                throw new Error('No valid receiver_discord_ids found in discord_members')
            }

            for (const receiverId of filteredDiscordIds) {
                await this.db.collection('karma_events').insertOne({
                    giver_discord_id: giverDiscordId,
                    receiver_discord_id: receiverId,
                    amount: 1,
                    timestamp: timestamp
                })

                const totalKarma = await this.getTotalKarma(receiverId)

                karmaCounts.push({
                    receiver_discord_id: receiverId,
                    total_karma: totalKarma
                })

                this.logger.info(`Karma given: ${giverDiscordId} -> ${receiverId}, new total: ${totalKarma}`)
            }

            return {
                success: true,
                karma_counts: karmaCounts,
                timestamp: timestamp.toISOString()
            }
        } catch (error) {
            this.logger.error('Error giving karma:', error)
            throw error
        }
    }

    /**
     * Get total karma for a specific user
     * @param discordId - Discord ID of the user
     * @returns Total karma count
     */
    async getTotalKarma(discordId: string): Promise<number> {
        const result = await this.db.collection('karma_events').aggregate([
            {
                $match: {
                    receiver_discord_id: discordId
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]).toArray()

        return result.length > 0 ? result[0].total : 0
    }

    /**
     * Get all karma counts for all users
     * @returns Array of karma counts sorted by total karma (descending)
     */
    async getAllKarmaCounts(): Promise<KarmaCount[]> {
        const result = await this.db.collection('karma_events').aggregate([
            {
                $group: {
                    _id: '$receiver_discord_id',
                    total: { $sum: '$amount' }
                }
            },
            {
                $sort: { total: -1 }
            }
        ]).toArray()

        return result.map((r: any) => ({
            receiver_discord_id: r._id,
            total_karma: r.total
        }))
    }

    /**
     * Get all members with their karma counts and profile information
     * @returns Array of members with karma, sorted by karma (descending)
     */
    async getAllMembersWithKarma() {
        try {
            const karmaAggregation = await this.db.collection('karma_events').aggregate([
                {
                    $group: {
                        _id: '$receiver_discord_id',
                        total_karma: { $sum: '$amount' }
                    }
                }
            ]).toArray()

            const karmaMap: Record<string, number> = {}
            for (const k of karmaAggregation) {
                karmaMap[k._id] = k.total_karma
            }

            const members = await this.db.collection('discord_members').find({}).toArray()

            const membersWithKarma = members.map(member => {
                let avatarUrl: string | null = null
                if (member.avatarFilename) {
                    avatarUrl = `/api/user/discord:${member.discordId}/avatar.png`
                }
                return {
                    discord_id: member.discord_id,
                    username: member.username,
                    avatar_id: member.avatar_id ?? null,
                    karma: karmaMap[member.discord_id] || 0,
                    avatar_url: avatarUrl
                }
            })

            membersWithKarma.sort((a, b) => b.karma - a.karma)

            return {
                members: membersWithKarma
            }
        } catch (error) {
            this.logger.error('Failed to fetch members with karma:', error)
            throw error
        }
    }
}

