// Server-side search over a city's warehouse list.
//
// Kyiv alone has ~6600 branches, which is 1.5 MB of JSON — far too much to
// hand the browser on every checkout. The full list stays in the server cache
// and only a matching page of it is ever sent.

import type { DeliveryWarehouse } from '~~/shared/types/delivery'

const WAREHOUSE_PAGE_SIZE = 50

export function filterWarehouses(
    warehouses: DeliveryWarehouse[],
    query: string,
    limit: number = WAREHOUSE_PAGE_SIZE
): DeliveryWarehouse[] {
    const normalized = (query || '').trim().toLowerCase()

    if (!normalized) {
        return warehouses.slice(0, limit)
    }

    // Buyers overwhelmingly search by branch number, and '12' appears inside
    // dozens of street addresses — so an exact number match is ranked above
    // any substring hit rather than buried under it.
    const exactNumber: DeliveryWarehouse[] = []
    const partial: DeliveryWarehouse[] = []

    for (const warehouse of warehouses) {
        if (warehouse.number.toLowerCase() === normalized) {
            exactNumber.push(warehouse)
        } else if (warehouse.name.toLowerCase().includes(normalized)) {
            partial.push(warehouse)
        }
    }

    return [...exactNumber, ...partial].slice(0, limit)
}
