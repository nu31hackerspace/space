import { useNitroApp } from "#imports"

export async function createOrUpdateUser(discordUserId: string, name: string, username: string) {
    const db = useNitroApp().db

    const user = {
        id: 'discord:' + discordUserId,
        name: name,
        username: username,
    }

    await db.collection('users').updateOne(
        { id: user.id },
        {
            $set: {
                ...user,
                updateAt: new Date()
            },
            $setOnInsert: {
                createAt: new Date(),
            }
        },
        { upsert: true }
    )
}