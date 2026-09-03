import {
    createError,
    defineEventHandler,
    getQuery,
    useNitroApp,
} from '#imports'
import { getWarehouses } from '~~/server/core/delivery/novaposhta/client'
import {
    isValidRef,
    NovaPoshtaError,
} from '~~/server/core/delivery/novaposhta/parse'
import { filterWarehouses } from '~~/server/core/delivery/warehouse-filter'

export default defineEventHandler(async (event) => {
    const cityRef = String(getQuery(event).cityRef || '').trim()

    if (!isValidRef(cityRef)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'A valid cityRef is required',
        })
    }

    const query = String(getQuery(event).q || '')

    try {
        // The whole city stays in the server-side cache; the browser only ever
        // receives a page of matches.
        return filterWarehouses(await getWarehouses(cityRef), query)
    } catch (error) {
        if (error instanceof NovaPoshtaError && error.isNotFound) {
            throw createError({
                statusCode: 404,
                statusMessage: 'City not found',
            })
        }
        useNitroApp().logger.error(
            'Nova Poshta warehouse lookup failed:',
            error
        )
        throw createError({
            statusCode: 502,
            statusMessage: 'Delivery service is unavailable',
        })
    }
})
