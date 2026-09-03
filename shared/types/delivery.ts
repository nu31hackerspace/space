// Nova Poshta pickers. The browser only ever sends refs; the server resolves
// them to names against the Nova Poshta API, so a spoofed label cannot end up
// on an order.

export interface DeliveryCity {
    ref: string
    name: string
    area: string
}

export interface DeliveryWarehouse {
    ref: string
    number: string
    name: string
    // 'Branch' for a counter, 'Postomat' for a parcel locker — they behave
    // differently (size limits, opening hours), so the buyer sees which is which.
    category: string
}
