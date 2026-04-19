// Helpers for building MongoDB query filters and pagination params
// from URL query parameters in content list endpoints.

export interface ContentQueryParams {
    tag?: string
    page?: string
    pageSize?: string
}

// Raised for user-supplied content query params that violate the supported
// request contract and should map to a 400 response at the route boundary.
export class ContentQueryValidationError extends Error {}

// Returns a MongoDB filter object for published posts.
// When a tag is provided, restricts results to posts that include that tag.
export function buildContentQuery(params: Pick<ContentQueryParams, 'tag'>): Record<string, unknown> {
    const filter: Record<string, unknown> = { status: 'published' }

    const tag = params.tag?.trim()
    if (tag) {
        if (tag.length > 100) {
            throw new ContentQueryValidationError('tag too long')
        }

        filter.tags = tag
    }

    return filter
}

// Parses and clamps pagination params from query strings.
// Defaults: page=1, pageSize=10. pageSize is capped at 100.
export function buildPaginationParams(params: Pick<ContentQueryParams, 'page' | 'pageSize'>): {
    page: number
    pageSize: number
} {
    const page = Math.max(parseInt(params.page || '1', 10) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(params.pageSize || '10', 10) || 10, 1), 100)
    return { page, pageSize }
}
