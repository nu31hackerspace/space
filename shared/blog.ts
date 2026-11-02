/** Parse the UTC timestamp stored for each blog post by Nuxt Content. */
export function contentDate(value: string): Date {
    return new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`)
}
