// Validation result used across the merch core.
//
// The core stays free of h3: it reports *what* is wrong as a plain message and
// leaves the decision of which HTTP status to return to server/api/merch/*.
// That is what keeps these functions unit-testable without a request.

export type ParseResult<T> =
    | { ok: true; value: T }
    | { ok: false; error: string }

export function ok<T>(value: T): ParseResult<T> {
    return { ok: true, value }
}

export function fail<T>(error: string): ParseResult<T> {
    return { ok: false, error }
}
