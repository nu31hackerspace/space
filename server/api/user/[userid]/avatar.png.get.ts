import { createError, defineEventHandler, getRouterParam, useNitroApp } from "#imports";
import { FileStoreType } from "~~/server/plugins/3_file_store";
import { UserSession } from "../../../core/user/user";

export default defineEventHandler(async (event) => {
    const avatarUserId = getRouterParam(event, 'userid') as string;

    const userSession = event.context.user as UserSession;
    if (!userSession) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
        });
    }

    if (userSession.userId !== avatarUserId) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
        });
    }

    const user = await useNitroApp().db.collection('users').findOne({ id: avatarUserId });

    const avatarFilename = user?.avatarFilename;
    if (!avatarFilename) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Avatar not found',
        });
    }

    const fileStore = useNitroApp().fileStores.getFileStore(FileStoreType.UserAvatar);
    const avatarFile = await fileStore.openDownloadStreamByName(avatarFilename);
    event.node.res.setHeader('Content-Type', 'image/png');
    event.node.res.setHeader('Cache-Control', 'public, max-age=86400');
    return avatarFile
})