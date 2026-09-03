// Pure construction of the Discord notification posted when an order is paid.
// Kept apart from ./discord.ts — which needs Nitro's runtime config — so the
// text can be asserted in a unit test.

import type { MerchOrder } from '~~/shared/types/merch'
import { formatDelivery, formatPrice } from '~~/shared/merch'

// Product and customer names are user-supplied and land in a Discord message,
// where these characters are formatting syntax. Escaping keeps a name like
// `**Вова**` from rewriting the layout of the notification.
export function escapeDiscordMarkdown(value: string): string {
    return (value || '').replace(/([\\`*_~|>])/g, '\\$1')
}

export function buildOrderPaidMessage(order: MerchOrder): string {
    const items = order.items
        .map(
            (item) =>
                `• ${escapeDiscordMarkdown(item.name)} × ${item.quantity} — ${formatPrice(item.sumKopecks)}`
        )
        .join('\n')

    // Name and phone are here because they are what creating a Nova Poshta
    // waybill actually needs. Email is deliberately left out — it is not needed
    // to ship anything, and it is one click away in /admin/merch.
    return [
        `🛒 **Нове замовлення** — ${formatPrice(order.totalKopecks)}`,
        items,
        `Отримувач: ${escapeDiscordMarkdown(order.customer.name)}, ${escapeDiscordMarkdown(order.customer.phone)}`,
        `Доставка: ${escapeDiscordMarkdown(formatDelivery(order.customer.delivery))}`,
        `Замовлення: \`${escapeDiscordMarkdown(order.reference)}\``,
    ].join('\n')
}
