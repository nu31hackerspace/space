export function createSlugFromName(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '')
        .replace(/\-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 64)
}

export function generateSlugFromTitle(title: string): string {
    const base = (title || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-')
        .slice(0, 60)

    const rand = Math.random().toString(36).slice(2, 8)
    return base ? `${base}-${rand}` : rand
}