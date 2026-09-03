import type { Db } from 'mongodb'
import { describe, expect, it, vi } from 'vitest'
import type { MerchOrder } from '~~/shared/types/merch'
import { settleOrder } from './repository'
import type { OrderDocument } from './order'

// A Db stand-in whose updateOne reports how many documents the guarded filter
// actually matched — which is the whole mechanism being tested here.
function fakeDb(modifiedCount: number) {
    const updateOne = vi.fn(async () => ({ modifiedCount }))
    return {
        db: { collection: () => ({ updateOne }) } as unknown as Db,
        updateOne,
    }
}

const order: OrderDocument & { reference: string } = {
    _id: { toString: () => 'o1' },
    reference: 'ref-123',
    status: 'processing',
    customer: {
        name: 'Вова',
        email: 'vova@example.com',
        phone: '+380671234567',
        delivery: {
            cityRef: 'c1',
            cityName: 'Київ',
            warehouseRef: 'w1',
            warehouseNumber: '12',
            warehouseName: 'Відділення №12',
        },
    },
    items: [],
    totalKopecks: 100000,
}

describe('settling an order', () => {
    it('notifies the buyer when the payment lands', async () => {
        const { db } = fakeDb(1)
        const notify = vi.fn<(order: MerchOrder) => Promise<void>>(
            async () => {}
        )

        const result = await settleOrder(db, order, 'success', notify)

        expect(result).toEqual({ status: 'paid', changed: true })
        expect(notify).toHaveBeenCalledTimes(1)
        expect(notify.mock.calls[0]![0].status).toBe('paid')
        expect(notify.mock.calls[0]![0].reference).toBe('ref-123')
    })

    // monobank retries a webhook up to three times and the result page polls
    // alongside it. Only the writer whose guarded update actually matched may
    // notify, or the buyer gets the same email twice.
    it('stays silent when another writer already applied the transition', async () => {
        const { db } = fakeDb(0)
        const notify = vi.fn(async () => {})

        const result = await settleOrder(db, order, 'success', notify)

        expect(result).toEqual({ status: 'processing', changed: false })
        expect(notify).not.toHaveBeenCalled()
    })

    it('does not notify for a failed payment', async () => {
        const { db } = fakeDb(1)
        const notify = vi.fn(async () => {})

        const result = await settleOrder(db, order, 'failure', notify)

        expect(result.status).toBe('failed')
        expect(notify).not.toHaveBeenCalled()
    })

    it('writes nothing and notifies nobody for an unmodelled status', async () => {
        const { db, updateOne } = fakeDb(1)
        const notify = vi.fn(async () => {})

        const result = await settleOrder(db, order, 'something-new', notify)

        expect(result).toEqual({ status: 'processing', changed: false })
        expect(updateOne).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })

    // A webhook retry can arrive after the result page already settled the
    // order, carrying an older status than the one on record.
    it('refuses to demote an order that is already paid', async () => {
        const { db, updateOne } = fakeDb(1)
        const notify = vi.fn(async () => {})

        const result = await settleOrder(
            db,
            { ...order, status: 'paid' },
            'created',
            notify
        )

        expect(result).toEqual({ status: 'paid', changed: false })
        expect(updateOne).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })

    it('does not re-notify when a paid order is reported paid again', async () => {
        const { db, updateOne } = fakeDb(1)
        const notify = vi.fn(async () => {})

        await settleOrder(db, { ...order, status: 'paid' }, 'success', notify)

        expect(updateOne).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })
})
