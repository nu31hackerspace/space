// Creates an order and hands the customer a monobank payment page.
// Open to guests by design — a logged-in buyer just gets their userId stamped
// on the order so it shows up in their profile.

import {
    createError,
    defineEventHandler,
    readBody,
    useNitroApp,
    useRuntimeConfig,
} from '#imports'
import { ObjectId } from 'mongodb'
import type {
    CreateMerchOrderBody,
    CreateMerchOrderResponse,
} from '~~/shared/types/merch'
import { requireDatabase } from '~~/server/core/runtime/database'
import { toProductResponse } from '~~/server/core/merch/product'
import {
    buildOrderItem,
    calculateTotalKopecks,
    validateCustomer,
} from '~~/server/core/merch/order'
import { MERCH_ORDERS, MERCH_PRODUCTS } from '~~/server/core/merch/repository'
import { buildInvoiceRequest } from '~~/server/core/merch/monobank/invoice'
import { createInvoice } from '~~/server/core/merch/monobank/client'
import { generateOrderReference } from '~~/server/core/merch/reference'
import { resolveWarehouse } from '~~/server/core/delivery/novaposhta/client'

export default defineEventHandler(
    async (event): Promise<CreateMerchOrderResponse> => {
        const config = useRuntimeConfig()
        const logger = useNitroApp().logger
        const db = requireDatabase(useNitroApp())

        if (!config.monobankToken) {
            logger.error('Merch checkout attempted without a monobank token')
            throw createError({
                statusCode: 503,
                statusMessage: 'Payments are not configured',
            })
        }

        const body = await readBody<CreateMerchOrderBody>(event)

        const customer = validateCustomer(body?.customer)
        if (!customer.ok) {
            throw createError({
                statusCode: 400,
                statusMessage: customer.error,
            })
        }

        const productId = body?.productId
        if (!productId || !ObjectId.isValid(productId)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid product ID',
            })
        }

        const productDocument = await db
            .collection(MERCH_PRODUCTS)
            .findOne({ _id: new ObjectId(productId) })

        if (!productDocument) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Product not found',
            })
        }

        const item = buildOrderItem(
            toProductResponse(productDocument),
            body?.quantity
        )
        if (!item.ok) {
            throw createError({ statusCode: 400, statusMessage: item.error })
        }

        // The branch is resolved server-side: this both proves the warehouse
        // belongs to the chosen city and supplies the names stored on the
        // order, so a crafted request cannot mislabel a delivery point.
        let delivery
        try {
            const resolved = await resolveWarehouse(
                customer.value.cityRef,
                customer.value.warehouseRef
            )

            if (!resolved) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Unknown Nova Poshta branch for this city',
                })
            }

            delivery = {
                cityRef: resolved.city.ref,
                cityName: resolved.city.name,
                warehouseRef: resolved.warehouse.ref,
                warehouseNumber: resolved.warehouse.number,
                warehouseName: resolved.warehouse.name,
            }
        } catch (error) {
            if ((error as { statusCode?: number }).statusCode) {
                throw error
            }
            logger.error('Failed to resolve Nova Poshta branch:', error)
            throw createError({
                statusCode: 502,
                statusMessage: 'Delivery service is unavailable',
            })
        }

        const items = [item.value]
        const totalKopecks = calculateTotalKopecks(items)

        const now = new Date()
        const orderDocument = {
            status: 'created',
            customer: {
                name: customer.value.name,
                email: customer.value.email,
                phone: customer.value.phone,
                delivery,
            },
            items,
            totalKopecks,
            userId: event.context.user?.userId ?? null,
            // invoiceId is deliberately absent until monobank issues one: the
            // unique index on it is sparse, and a sparse index still indexes an
            // explicit null, so several unpaid orders would collide on it.
            createdAt: now,
            updatedAt: now,
        }

        // A readable reference draws from a finite pool, so a duplicate is
        // possible where a UUID's was not. The unique index is what actually
        // decides; this simply draws again when it rejects one.
        let reference = ''
        for (let attempt = 0; attempt < 5 && !reference; attempt += 1) {
            const candidate = generateOrderReference()
            try {
                await db
                    .collection(MERCH_ORDERS)
                    .insertOne({ ...orderDocument, reference: candidate })
                reference = candidate
            } catch (error) {
                if ((error as { code?: number }).code !== 11000) {
                    throw error
                }
                logger.warn(`Order reference collision on ${candidate}`)
            }
        }

        if (!reference) {
            logger.error('Could not allocate a unique order reference')
            throw createError({
                statusCode: 500,
                statusMessage: 'Could not create the order',
            })
        }

        try {
            const invoice = await createInvoice(
                config.monobankToken,
                buildInvoiceRequest({
                    reference,
                    items,
                    totalKopecks,
                    customerEmail: customer.value.email,
                    baseUrl: config.public.baseUrl,
                })
            )

            await db.collection(MERCH_ORDERS).updateOne(
                { reference },
                {
                    $set: {
                        invoiceId: invoice.invoiceId,
                        pageUrl: invoice.pageUrl,
                        updatedAt: new Date(),
                    },
                }
            )

            logger.info(
                `Merch order ${reference} created with invoice ${invoice.invoiceId}`
            )

            return { reference, pageUrl: invoice.pageUrl }
        } catch (error) {
            // No invoice means the order can never be paid — drop it rather
            // than leave a permanently `created` row in the admin list.
            await db.collection(MERCH_ORDERS).deleteOne({ reference })
            logger.error('Failed to create monobank invoice:', error)
            throw createError({
                statusCode: 502,
                statusMessage: 'Payment provider is unavailable',
            })
        }
    }
)
