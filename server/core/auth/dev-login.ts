import { createError } from 'h3'

export function buildDevLoginUser() {
    return {
        id: 'dev:local-admin',
        name: 'Local Admin',
        username: 'dev-admin',
        avatarId: '',
    }
}

export function assertDevLoginAllowed(isProduction: boolean) {
    if (isProduction) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
        })
    }
}
