// Types shared by the merch storefront (app/) and the merch API (server/).
//
// Money is always kopecks. monobank acquiring works exclusively in minor
// currency units, so keeping the whole pipeline in integers means no float
// rounding can ever reach an invoice. UAH only ever appears in the UI layer.

export const MERCH_CCY_UAH = 980

// Both the admin form and the upload endpoint enforce this.
export const MAX_PRODUCT_IMAGES = 15

export interface MerchProduct {
    id: string
    // URL key: a transliterated name plus a short hash for uniqueness.
    slug: string
    name: string
    description: string
    priceKopecks: number
    // Ordered; the first one is the cover shown in the grid.
    imageFilenames: string[]
    isAvailable: boolean
    createdAt: string
}

// Order lifecycle. `created` is set the moment the customer is handed a
// monobank payment page; every later value mirrors a monobank invoice status
// (see mapInvoiceStatus in server/core/merch/order.ts).
export type MerchOrderStatus =
    | 'created'
    | 'processing'
    | 'paid'
    | 'failed'
    | 'expired'
    | 'reversed'

// Where the parcel goes. Resolved server-side from the refs the buyer picked,
// never from labels the browser sent — see server/api/merch/orders/index.post.ts.
export interface MerchDelivery {
    cityRef: string
    cityName: string
    warehouseRef: string
    warehouseNumber: string
    warehouseName: string
}

export interface MerchCustomer {
    name: string
    email: string
    phone: string
    delivery: MerchDelivery
}

// What the checkout form submits: contact details plus the two Nova Poshta
// refs. Names are deliberately absent — the server looks them up.
export interface MerchCustomerInput {
    name: string
    email: string
    phone: string
    cityRef: string
    warehouseRef: string
}

export interface MerchOrderItem {
    productId: string
    name: string
    quantity: number
    priceKopecks: number
    sumKopecks: number
}

export interface MerchOrder {
    id: string
    reference: string
    status: MerchOrderStatus
    customer: MerchCustomer
    items: MerchOrderItem[]
    totalKopecks: number
    userId: string | null
    createdAt: string
    updatedAt: string
}

export interface CreateMerchOrderBody {
    productId: string
    quantity: number
    customer: MerchCustomerInput
}

export interface CreateMerchOrderResponse {
    reference: string
    pageUrl: string
}

export interface MerchOrderStatusResponse {
    reference: string
    status: MerchOrderStatus
    totalKopecks: number
}
