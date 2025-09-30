import type { TrackRequest } from '~~/shared/types/track_body'

export async function trackEvent(
    action: string,
    page: string,
    data: Record<string, string> = {},
): Promise<void> {
    try {
        const trackRequest: TrackRequest = {
            action,
            page,
            data: new Map(Object.entries(data))
        }

        await $fetch('/api/track', {
            method: 'POST',
            body: trackRequest
        })
    } catch (error) {
        console.warn('Failed to track event:', error)
    }
}
