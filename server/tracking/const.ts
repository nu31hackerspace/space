export const TRACKING_COOKIE_NAME = 'session-key'
export const COUNTRY_HEADER_NAME = 'cf-ipcountry'
export const TRACKING_SESSION_KEY_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Tracking session keys are generated with randomUUID(), so routes can ignore
// malformed cookies instead of persisting arbitrary user-provided values.
export function isValidTrackingSessionKey(value: string | undefined): value is string {
    return typeof value === 'string' && TRACKING_SESSION_KEY_RE.test(value)
}
