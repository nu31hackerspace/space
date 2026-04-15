// Navigation helpers for prev/next post links on article pages.

export interface NavPost {
    slug: string
    title: string
}

// Extracts the minimal fields needed for prev/next navigation from a raw DB record.
// Returns null when no adjacent post exists.
export function pickNavPost(post: { slug?: string; title?: string } | null | undefined): NavPost | null {
    if (!post || !post.slug) return null
    return { slug: post.slug, title: post.title || '' }
}
