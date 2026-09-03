// City search for the checkout picker. Proxied rather than called from the
// browser so the Nova Poshta key stays on the server.

import {
    createError,
    defineEventHandler,
    getQuery,
    useNitroApp,
} from '#imports'
import { searchCities } from '~~/server/core/delivery/novaposhta/client'

const MIN_QUERY_LENGTH = 2

export default defineEventHandler(async (event) => {
    const query = String(getQuery(event).q || '').trim()

    // Nova Poshta returns the whole country for a short string; requiring two
    // characters keeps both their rate limit and our cache sane.
    if (query.length < MIN_QUERY_LENGTH) {
        return []
    }

    try {
        return await searchCities(query)
    } catch (error) {
        useNitroApp().logger.error('Nova Poshta city search failed:', error)
        throw createError({
            statusCode: 502,
            statusMessage: 'Delivery service is unavailable',
        })
    }
})
