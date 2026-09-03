import { describe, expect, it } from 'vitest'
import { formatDelivery, formatKopecks, formatPrice } from './merch'

describe('merch price formatting', () => {
    it('drops the decimal tail for whole hryvnias', () => {
        expect(formatKopecks(50000)).toBe('500')
    })

    it('keeps two decimals otherwise', () => {
        expect(formatKopecks(50050)).toBe('500.50')
        expect(formatKopecks(5)).toBe('0.05')
    })

    it('treats a missing amount as zero', () => {
        expect(formatKopecks(0)).toBe('0')
    })

    it('appends the currency sign', () => {
        expect(formatPrice(120000)).toBe('1200 ₴')
    })
})

describe('delivery formatting', () => {
    const delivery = {
        cityRef: 'c1',
        cityName: 'Київ',
        warehouseRef: 'w1',
        warehouseNumber: '12',
        warehouseName: 'Відділення №12: вул. Хрещатик, 1',
    }

    it('prefers the short branch number', () => {
        expect(formatDelivery(delivery)).toBe('Київ, відділення №12')
    })

    it('falls back to the full branch name for a postomat', () => {
        expect(
            formatDelivery({
                ...delivery,
                warehouseNumber: '',
                warehouseName: 'Поштомат №44',
            })
        ).toBe('Київ, Поштомат №44')
    })

    it('is empty when nothing was chosen', () => {
        expect(formatDelivery(undefined)).toBe('')
    })
})
