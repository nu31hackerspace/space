// Nova Poshta API access, with the caching the checkout form depends on.
// Parsing lives in ./parse.ts so the shape handling is testable on its own.

import { useRuntimeConfig } from '#imports'
import type { DeliveryCity, DeliveryWarehouse } from '~~/shared/types/delivery'
import { TtlCache } from '../cache'
import { NovaPoshtaError, parseCities, parseWarehouses } from './parse'

const NOVA_POSHTA_API = 'https://api.novaposhta.ua/v2.0/json/'

// Reference data that changes on the order of weeks. Six hours keeps a busy
// day down to a handful of calls while never serving a truly stale branch list.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000

const cityCache = new TtlCache<DeliveryCity[]>(CACHE_TTL_MS, 200)
const warehouseCache = new TtlCache<DeliveryWarehouse[]>(CACHE_TTL_MS, 200)

async function callNovaPoshta(
    calledMethod: string,
    methodProperties: Record<string, string>
): Promise<unknown> {
    const apiKey = useRuntimeConfig().novaPoshtaApiKey

    if (!apiKey) {
        throw new NovaPoshtaError('Nova Poshta API key is not configured')
    }

    const response = await fetch(NOVA_POSHTA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            apiKey,
            modelName: 'Address',
            calledMethod,
            methodProperties,
        }),
    })

    if (!response.ok) {
        throw new NovaPoshtaError(
            `Nova Poshta request failed with ${response.status}`
        )
    }

    return response.json()
}

export async function searchCities(query: string): Promise<DeliveryCity[]> {
    const normalized = query.trim().toLowerCase()
    const cached = cityCache.get(normalized)

    if (cached) {
        return cached
    }

    const cities = parseCities(
        await callNovaPoshta('getCities', { FindByString: query.trim() })
    )

    cityCache.set(normalized, cities)
    return cities
}

export async function getWarehouses(
    cityRef: string
): Promise<DeliveryWarehouse[]> {
    const cached = warehouseCache.get(cityRef)

    if (cached) {
        return cached
    }

    const warehouses = parseWarehouses(
        await callNovaPoshta('getWarehouses', { CityRef: cityRef })
    )

    warehouseCache.set(cityRef, warehouses)
    return warehouses
}

// Resolves the pair the buyer picked into the names stored on the order, and
// in doing so proves the warehouse really belongs to that city — the client is
// never trusted for either fact.
export async function resolveWarehouse(
    cityRef: string,
    warehouseRef: string
): Promise<{ city: DeliveryCity; warehouse: DeliveryWarehouse } | null> {
    const warehouses = await getWarehouses(cityRef)
    const warehouse = warehouses.find((item) => item.ref === warehouseRef)

    // A warehouse ref that is not in this city's list is either a mistake or an
    // attempt to pair a cheap city with someone else's branch. Either way, no.
    if (!warehouse) {
        return null
    }

    // getWarehouses does not echo the city name, so it is fetched by ref.
    const city = await findCityByRef(cityRef)

    if (!city) {
        return null
    }

    return { city, warehouse }
}

const cityByRefCache = new TtlCache<DeliveryCity>(CACHE_TTL_MS, 500)

async function findCityByRef(cityRef: string): Promise<DeliveryCity | null> {
    const cached = cityByRefCache.get(cityRef)
    if (cached) {
        return cached
    }

    const cities = parseCities(
        await callNovaPoshta('getCities', { Ref: cityRef })
    )
    const city = cities.find((item) => item.ref === cityRef)

    if (!city) {
        return null
    }

    cityByRefCache.set(cityRef, city)
    return city
}
