import { useNitroApp } from "#imports"
import { FileStoreType } from "~~/server/plugins/3_file_store";
import { discordAvatarUrl } from "./utils";

export type DiscordMember = {
    discordId: string,
    username: string,
    avatarId: string | null,
}

export async function syncDiscordMembers(members: DiscordMember[]) {
    const db = useNitroApp().db
    await members.reduce(async (prevPromise, member) => {
        console.log('Syncing discord member:', member.discordId, 'username:', member.username, 'avatarId:', member.avatarId)
        await prevPromise;
        const existingMember = await db.collection('discord_members').findOne({ discordId: member.discordId });
        if (existingMember) {
            await db.collection('discord_members').updateOne(
                { discordId: member.discordId },
                { $set: { username: member.username, avatarId: member.avatarId } },
                { upsert: true }
            );
        } else {
            await db.collection('discord_members').insertOne({
                id: 'discord:' + member.discordId,
                discordId: member.discordId,
                username: member.username,
                avatarId: member.avatarId
            });
        }

        try {
            const fileStore = useNitroApp().fileStores.getFileStore(FileStoreType.UserAvatar)
            const avatarUrl = discordAvatarUrl(member.discordId, member.avatarId)
            if (avatarUrl) {
                const avatarFilename = 'avatar-' + member.discordId + '.png'
                await fileStore.saveFileByUrl(avatarUrl as string, avatarFilename)
                await db.collection('discord_members').updateOne(
                    { discordId: member.discordId },
                    { $set: { avatarFilename: avatarFilename } }
                );
            }
        } catch (error) {
            useNitroApp().logger.info('Error syncing discord member:', member.discordId, 'username:', member.username, 'avatarId:', member.avatarId, 'error:', error)
            throw error
        }
    }, Promise.resolve());
}

export async function addNewDiscordMembers(member: DiscordMember) {
    useNitroApp().logger.info('Adding new discord member:', member.discordId, 'username:', member.username, 'avatarId:', member.avatarId)
    const db = useNitroApp().db;
    const existingMember = await db.collection('discord_members').findOne({ discordId: member.discordId });
    if (existingMember) {
        return;
    }
    await db.collection('discord_members').insertOne({
        discordId: member.discordId,
        username: member.username,
        avatarId: member.avatarId
    });

    try {
        const fileStore = useNitroApp().fileStores.getFileStore(FileStoreType.UserAvatar)
        const avatarUrl = discordAvatarUrl(member.discordId, member.avatarId)
        if (avatarUrl) {
            const avatarFilename = 'avatar-' + member.discordId + '.png'
            await fileStore.saveFileByUrl(avatarUrl as string, avatarFilename)
            await db.collection('discord_members').updateOne(
                { discordId: member.discordId },
                { $set: { avatarFilename: avatarFilename } }
            );
        }
    } catch (error) {
        useNitroApp().logger.info('Error syncing discord member:', member.discordId, 'username:', member.username, 'avatarId:', member.avatarId, 'error:', error)
        throw error
    }
}