// A tiny TTL cache for Nova Poshta lookups.
//
// The warehouse list for a city is a few hundred rows that change maybe once a
// month, and the checkout form asks for it on every page view. Caching keeps us
// well inside Nova Poshta's rate limit and makes the picker feel instant.
//
// In-memory and per-instance on purpose: it is a cache of public reference data,
// so a cold start after a deploy costs one extra API call, not correctness.

export class TtlCache<T> {
    private entries = new Map<string, { value: T; expiresAt: number }>()

    // `now` is injectable so expiry can be tested without waiting.
    constructor(
        private ttlMs: number,
        private maxEntries = 500,
        private now: () => number = Date.now
    ) {}

    get(key: string): T | undefined {
        const entry = this.entries.get(key)

        if (!entry) {
            return undefined
        }

        if (entry.expiresAt <= this.now()) {
            this.entries.delete(key)
            return undefined
        }

        // Refresh insertion order so the eviction below drops the
        // least-recently-read key rather than the oldest-written one.
        this.entries.delete(key)
        this.entries.set(key, entry)

        return entry.value
    }

    set(key: string, value: T): void {
        this.entries.delete(key)
        this.entries.set(key, { value, expiresAt: this.now() + this.ttlMs })

        while (this.entries.size > this.maxEntries) {
            const oldest = this.entries.keys().next()
            if (oldest.done) {
                break
            }
            this.entries.delete(oldest.value)
        }
    }

    get size(): number {
        return this.entries.size
    }
}
