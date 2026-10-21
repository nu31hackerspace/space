// The merch catalog. It is static on purpose: to add or change a product, edit
// this list and drop its photos into public/img/merch/.
//
// There is no checkout. A buyer donates the price to the monobank jar and writes
// their phone, city and Nova Poshta branch in the donation comment; the team
// ships from the jar's statement.

export const MERCH_JAR_URL = 'https://send.monobank.ua/jar/3QzivsKben'

export interface MerchProduct {
    // URL key, kept identical to the old database slugs so shared links work.
    slug: string
    name: string
    description: string
    priceUah: number
    // Ordered; the first one is the cover shown in the grid.
    images: string[]
    isAvailable: boolean
}

export const MERCH_PRODUCTS: MerchProduct[] = [
    {
        slug: 'flyus-u-kistochtsi-vid-nyu31-ne-potrebuye-zmyvky-e24961',
        name: 'Флюс у кісточці, від НЮ31 не потребує змивки',
        description: `Флюс-олівець (кісточка) від Київського Хакерспейсу NU31, зроблений мейкерами для мейкерів.

✨ Характеристики:
• Флюс неактивний, змивка не потрібна
• Зручний формат кісточки з пензликом
• Підходить для пайки SMD-компонентів та проводів, DIP, та всього, що не алюміній чи чавун.

Купуючи цей флюс, ви підтримуєте роботу Київського Хакерспейсу NU31 та розвиток інженерії в Україні.`,
        priceUah: 500,
        images: [
            '/img/merch/flux-1.webp',
            '/img/merch/flux-2.webp',
            '/img/merch/flux-3.webp',
            '/img/merch/flux-4.webp',
            '/img/merch/flux-5.webp',
        ],
        isAvailable: true,
    },
]

export function findMerchProduct(slug: string): MerchProduct | null {
    return MERCH_PRODUCTS.find((product) => product.slug === slug) || null
}

export function formatPrice(uah: number): string {
    return `${uah} ₴`
}

// Shown next to the jar link so buyers copy the format we parse by eye.
export const DONATION_COMMENT_EXAMPLE =
    'Шевченко Тарас, +380671234567, Київ, НП №12'
