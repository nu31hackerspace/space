export const TRACKING_COOKIE_NAME = 'session-key'
export const COUNTRY_HEADER_NAME = 'cf-ipcountry'
export const TRACKING_COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000
export const TRACKING_SESSION_KEY_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
