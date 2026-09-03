// Pure construction of the order emails. Kept apart from ./email.ts — which
// talks to Resend through Nitro's runtime config — so what a buyer actually
// receives can be asserted in a unit test with no network and no Nitro.

import type { MerchOrder } from '~~/shared/types/merch'
import { formatDelivery, formatPrice } from '~~/shared/merch'

// Order data is customer-supplied and lands inside an HTML email, so every
// interpolated value goes through here first.
export function escapeHtml(value: string): string {
    return (value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

export interface EmailMessage {
    subject: string
    html: string
}

export function buildOrderPaidEmail(order: MerchOrder): EmailMessage {
    const items = order.items
        .map((item) => {
            const name = escapeHtml(item.name)
            return `<li>${name} × ${item.quantity} — ${formatPrice(item.sumKopecks)}</li>`
        })
        .join('')

    const html = `
        <p>Привіт, ${escapeHtml(order.customer.name)}!</p>
        <p>Ми отримали оплату на ${formatPrice(order.totalKopecks)}. Дякуємо за підтримку хакерспейсу NU31.</p>
        <p><b>Замовлення:</b></p>
        <ul>${items}</ul>
        <p><b>Доставка:</b><br>${escapeHtml(formatDelivery(order.customer.delivery))}</p>
        <p>Ми надішлемо посилку та повідомимо номер накладної на цю адресу.</p>
        <p>Номер замовлення: ${escapeHtml(order.reference)}</p>
        <p>NU31 Hacker Space</p>
    `.trim()

    return {
        subject: `Замовлення мерчу NU31 оплачено — ${formatPrice(order.totalKopecks)}`,
        html,
    }
}
