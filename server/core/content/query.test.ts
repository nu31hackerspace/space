import { describe, expect, it } from 'vitest'
import { buildContentQuery, buildPaginationParams } from './query'

describe('buildContentQuery', () => {
    it('returns published filter without tag by default', () => {
        expect(buildContentQuery({})).toEqual({ status: 'published' })
    })

    it('adds tags filter when tag param is provided', () => {
        expect(buildContentQuery({ tag: 'space' })).toEqual({ status: 'published', tags: 'space' })
    })

    it('ignores empty tag string', () => {
        expect(buildContentQuery({ tag: '' })).toEqual({ status: 'published' })
    })

    it('ignores whitespace-only tag', () => {
        expect(buildContentQuery({ tag: '   ' })).toEqual({ status: 'published' })
    })
})

describe('buildPaginationParams', () => {
    it('defaults to page 1 and pageSize 10', () => {
        expect(buildPaginationParams({})).toEqual({ page: 1, pageSize: 10 })
    })

    it('parses page and pageSize from strings', () => {
        expect(buildPaginationParams({ page: '3', pageSize: '5' })).toEqual({ page: 3, pageSize: 5 })
    })

    it('clamps page to minimum 1', () => {
        expect(buildPaginationParams({ page: '-1' })).toEqual({ page: 1, pageSize: 10 })
    })

    it('clamps pageSize to maximum 100', () => {
        expect(buildPaginationParams({ pageSize: '999' })).toEqual({ page: 1, pageSize: 100 })
    })

    it('clamps pageSize to minimum 1', () => {
        expect(buildPaginationParams({ pageSize: '0' })).toEqual({ page: 1, pageSize: 10 })
    })
})
