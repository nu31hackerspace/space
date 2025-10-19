import { useNitroApp } from '#imports'
import { Db } from 'mongodb'

export type KarmaCount = {
    receiver_discord_id: string
    total_karma: number
}

export type GiveKarmaResult = {
    success: boolean
    receiver_discord_id: string
    total_karma: number
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
     * Give karma from one user to a receiver
     * @param giverDiscordId - Discord ID of the user giving karma
     * @param receiverDiscordId - Discord ID of the user receiving karma
     * @param reason - Optional reason for giving karma
     * @returns Result containing karma count for the receiver
     * @throws Error if validation fails or database operation fails
     */
    async giveKarma(
        giverDiscordId: string,
        receiverDiscordId: string,
        reason?: string
    ): Promise<GiveKarmaResult> {
        if (!giverDiscordId) {
            throw new Error('giver_discord_id is required')
        }

        if (!receiverDiscordId) {
            throw new Error('receiver_discord_id is required')
        }

        if (receiverDiscordId === giverDiscordId) {
            throw new Error('Хтось пробує сам собі дати карму!')
        }

        try {
            const timestamp = new Date()

            this.logger.info('Giving karma to receiver:', {
                giverDiscordId,
                receiverDiscordId,
                reason: reason || 'No reason provided'
            })

            const existingMember = await this.db.collection('discord_members').findOne({
                discordId: receiverDiscordId
            })

            if (!existingMember) {
                throw new Error('Receiver not found in discord_members')
            }

            const karmaEvent: any = {
                giver_discord_id: giverDiscordId,
                receiver_discord_id: receiverDiscordId,
                amount: 1,
                timestamp: timestamp
            }

            if (reason) {
                karmaEvent.reason = reason
            }

            await this.db.collection('karma_events').insertOne(karmaEvent)

            const totalKarma = await this.getTotalKarma(receiverDiscordId)

            this.logger.info(`Karma given: ${giverDiscordId} -> ${receiverDiscordId}, new total: ${totalKarma}${reason ? `, reason: ${reason}` : ''}`)

            return {
                success: true,
                receiver_discord_id: receiverDiscordId,
                total_karma: totalKarma,
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

