import { useNitroApp } from "#imports"

export type User = {
    id: string
    name: string
    username: string
}

export type AuthTechnicalInfo = {
    userAgent: string,
    country: string,
    sessionKey: string,
}

export async function createOrUpdateUser(user: User, authTechnicalInfo: AuthTechnicalInfo) {
    const db = useNitroApp().db

    await db.collection('users').updateOne(
        { id: user.id },
        {
            $set: {
                ...user,
                updateAt: new Date()
            },
            $setOnInsert: {
                createAt: new Date(),
            },
            $push: {
                sessions: {
                    sessionKey: authTechnicalInfo.sessionKey,
                    userAgent: authTechnicalInfo.userAgent,
                    country: authTechnicalInfo.country,
                    createAt: new Date(),
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                } as any
            }
        },
        { upsert: true }
    )

    await db.collection('tracking').updateMany(
        {
            sessionKey: authTechnicalInfo.sessionKey,
            $or: [
                { userId: null },
                { userId: { $exists: false } }
            ]
        },
        { $set: { userId: user.id } }
    )
}