// Order emails, sent through Resend.
//
// Same shape as the nest2d integration: a plain POST to the Resend API with the
// token from runtimeConfig, no SDK dependency. Message building lives in
// ./email-message.ts and is unit-tested there.

import { useNitroApp, useRuntimeConfig } from '#imports'
import type { MerchOrder } from '~~/shared/types/merch'
import { buildOrderPaidEmail, type EmailMessage } from './email-message'

async function sendEmail(to: string, message: EmailMessage): Promise<void> {
    const config = useRuntimeConfig()

    if (!config.resendToken) {
        useNitroApp().logger.warn(
            'Resend token is not configured — skipping order email'
        )
        return
    }

    await $fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.resendToken}`,
        },
        body: {
            from: config.resendFrom,
            to,
            subject: message.subject,
            html: message.html,
        },
    })
}

// Never throws: the payment already succeeded, and a mail provider outage must
// not turn a paid order into a failed webhook that monobank keeps retrying.
export async function sendOrderPaidEmail(order: MerchOrder): Promise<void> {
    const logger = useNitroApp().logger

    try {
        await sendEmail(order.customer.email, buildOrderPaidEmail(order))
        logger.info(`Order paid email sent for ${order.reference}`)
    } catch (error) {
        logger.error(
            `Failed to send order paid email for ${order.reference}:`,
            error
        )
    }
}
