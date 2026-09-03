import { describe, expect, it } from 'vitest'
import type { DeliveryWarehouse } from '~~/shared/types/delivery'
import { filterWarehouses } from './warehouse-filter'

function warehouse(
    number: string,
    name: string,
    category = 'Branch'
): DeliveryWarehouse {
    return { ref: `ref-${number}`, number, name, category }
}

const warehouses = [
    warehouse('1', 'Відділення №1: вул. Пирогівський шлях, 135'),
    warehouse('2', 'Відділення №2: вул. Богатирська, 11'),
    warehouse('12', 'Відділення №12: вул. Хрещатик, 12'),
    warehouse('135', 'Відділення №135: вул. Лугова, 1'),
    warehouse('44', 'Поштомат №44: вул. Хрещатик, 5', 'Postomat'),
]

describe('warehouse filtering', () => {
    it('returns the head of the list when nothing is typed', () => {
        expect(filterWarehouses(warehouses, '', 2)).toHaveLength(2)
        expect(filterWarehouses(warehouses, '   ', 2)).toHaveLength(2)
    })

    // '12' appears in several street addresses; the branch actually numbered 12
    // is what the buyer meant.
    it('ranks an exact branch number above substring matches', () => {
        const result = filterWarehouses(warehouses, '12')

        expect(result[0]!.number).toBe('12')
    })

    it('still includes the substring matches after the exact one', () => {
        const numbers = filterWarehouses(warehouses, '135').map((w) => w.number)

        expect(numbers[0]).toBe('135')
        expect(numbers).toContain('1')
    })

    it('matches on the address text', () => {
        const numbers = filterWarehouses(warehouses, 'хрещатик').map(
            (w) => w.number
        )

        expect(numbers).toEqual(['12', '44'])
    })

    it('is case insensitive', () => {
        expect(filterWarehouses(warehouses, 'ПОШТОМАТ')).toHaveLength(1)
    })

    it('caps the result at the limit', () => {
        expect(filterWarehouses(warehouses, 'відділення', 2)).toHaveLength(2)
    })

    it('returns nothing when there is no match', () => {
        expect(filterWarehouses(warehouses, 'Львів')).toEqual([])
    })
})
