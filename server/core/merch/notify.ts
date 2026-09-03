// Everything that fires once an order is paid, behind one function so
// settleOrder keeps a single send-once hook.

import type { MerchOrder } from '~~/shared/types/merch'
import { sendOrderPaidEmail } from './email'
import { sendOrderPaidDiscordMessage } from './discord'

export async function notifyOrderPaid(order: MerchOrder): Promise<void> {
    // allSettled, not all: the buyer's receipt and the team's Discord ping are
    // independent, and neither losing its provider should suppress the other.
    await Promise.allSettled([
        sendOrderPaidEmail(order),
        sendOrderPaidDiscordMessage(order),
    ])
}
