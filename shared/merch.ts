import type { MerchDelivery } from './types/merch'

// Display helpers for merch prices. Lives in shared/ because both the
// storefront and the admin list render kopecks, and the app/ side must not
// reach into server/core.

// Whole hryvnias lose the '.00' tail — '500 ₴' reads better on a product card
// than '500.00 ₴'.
export function formatKopecks(kopecks: number): string {
    const hryvnias = (kopecks || 0) / 100

    return Number.isInteger(hryvnias) ? String(hryvnias) : hryvnias.toFixed(2)
}

export function formatPrice(kopecks: number): string {
    return `${formatKopecks(kopecks)} ₴`
}

// Human-readable delivery address for emails, the admin table and the profile.
export function formatDelivery(delivery: MerchDelivery | undefined): string {
    if (!delivery?.cityName) {
        return ''
    }

    const branch = delivery.warehouseNumber
        ? `відділення №${delivery.warehouseNumber}`
        : delivery.warehouseName

    return branch ? `${delivery.cityName}, ${branch}` : delivery.cityName
}
