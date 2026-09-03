import { describe, expect, it } from 'vitest'
import {
    isValidRef,
    NovaPoshtaError,
    parseCities,
    parseEnvelope,
    parseWarehouses,
} from './parse'

describe('nova poshta envelope', () => {
    it('returns the data array on success', () => {
        expect(parseEnvelope({ success: true, data: [{ Ref: 'a' }] })).toEqual([
            { Ref: 'a' },
        ])
    })

    it('returns an empty list when data is missing', () => {
        expect(parseEnvelope({ success: true })).toEqual([])
    })

    // Nova Poshta answers 200 even for failures and puts the reason in the
    // body, so this is the only place a failed call is detected.
    it('throws with the reported errors when success is false', () => {
        expect(() =>
            parseEnvelope({ success: false, errors: ['API key expired'] })
        ).toThrow(/API key expired/)
    })

    it('throws a generic error when no reason is given', () => {
        expect(() => parseEnvelope({ success: false })).toThrow(NovaPoshtaError)
    })

    it('rejects a body that is not an envelope', () => {
        expect(() => parseEnvelope(null)).toThrow(NovaPoshtaError)
        expect(() => parseEnvelope('nope')).toThrow(NovaPoshtaError)
    })
})

describe('nova poshta cities', () => {
    it('maps the fields the picker needs', () => {
        const cities = parseCities({
            success: true,
            data: [
                {
                    Ref: 'city-1',
                    Description: 'Київ',
                    AreaDescription: 'Київська',
                },
            ],
        })

        expect(cities).toEqual([
            { ref: 'city-1', name: 'Київ', area: 'Київська' },
        ])
    })

    it('drops rows without a ref or a name', () => {
        const cities = parseCities({
            success: true,
            data: [
                { Ref: 'city-1' },
                { Description: 'Львів' },
                { Ref: 'city-2', Description: 'Львів' },
            ],
        })

        expect(cities).toHaveLength(1)
        expect(cities[0]!.ref).toBe('city-2')
    })
})

describe('nova poshta warehouses', () => {
    it('keeps the branch number and category', () => {
        const warehouses = parseWarehouses({
            success: true,
            data: [
                {
                    Ref: 'wh-1',
                    Description: 'Відділення №1: вул. Хрещатик, 1',
                    Number: '1',
                    CategoryOfWarehouse: 'Branch',
                },
            ],
        })

        expect(warehouses).toEqual([
            {
                ref: 'wh-1',
                number: '1',
                name: 'Відділення №1: вул. Хрещатик, 1',
                category: 'Branch',
            },
        ])
    })

    it('tolerates a missing number and category', () => {
        const warehouses = parseWarehouses({
            success: true,
            data: [{ Ref: 'wh-1', Description: 'Поштомат' }],
        })

        expect(warehouses[0]).toEqual({
            ref: 'wh-1',
            number: '',
            name: 'Поштомат',
            category: '',
        })
    })
})

describe('nova poshta ref validation', () => {
    it('accepts a uuid', () => {
        expect(isValidRef('8d5a980d-391c-11dd-90d9-001a92567626')).toBe(true)
    })

    it('rejects anything else', () => {
        expect(isValidRef('')).toBe(false)
        expect(isValidRef('city-1')).toBe(false)
        expect(isValidRef('8d5a980d391c11dd90d9001a92567626')).toBe(false)
    })
})
