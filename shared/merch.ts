// Merch cards for the listings on the home page and /merch. Each product has
// its own hand-written page in app/pages/merch/<slug>.vue; this list only
// links to them.
//
// There is no checkout. A buyer donates to the monobank jar and writes their
// phone, city and Nova Poshta branch in the donation comment; the team ships
// from the jar's statement.

export const MERCH_JAR_URL = 'https://send.monobank.ua/jar/3QzivsKben'

export interface MerchCard {
    // Must match the page file app/pages/merch/<slug>.vue. When renaming one,
    // add the old path to app/utils/redirects.ts so shared links keep working.
    slug: string
    name: string
    priceUah: number
    cover: string
}

export const MERCH_PRODUCTS: MerchCard[] = [
    {
        slug: 'flux',
        name: 'Флюс у кісточці, від НЮ31 не потребує змивки',
        priceUah: 500,
        cover: '/img/merch/flux-1.webp',
    },
    {
        slug: 'oil',
        name: 'Олива в кісточці для 3D-принтерів, від НЮ31',
        priceUah: 500,
        cover: '/img/merch/oil-1.webp',
    },
]

export function formatPrice(uah: number): string {
    return `${uah} ₴`
}

// Shown next to the jar link so buyers copy the format we parse by eye.
export const DONATION_COMMENT_EXAMPLE =
    'Шевченко Тарас, +380671234567, Київ, НП №12'
