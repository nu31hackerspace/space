// Normalizes and validates blog post write input from API request bodies.
// Centralizes all field cleaning and business rules so individual endpoints
// don't need to repeat validation logic.

type BlogStatus = 'draft' | 'published'

interface WriteBody {
    title?: string
    markdown?: string
    status?: BlogStatus
    tags?: string[]
    coverImageUrl?: string
    coverImageAlt?: string
    isFeatured?: boolean
    authorName?: string
}

interface ExistingPost {
    publishedAt?: Date | string
}

interface NormalizeOptions {
    mode: 'create' | 'update'
    body: WriteBody
    existingPost?: ExistingPost
    now: Date
}

interface NormalizedWriteInput {
    title?: string
    rawMarkdown?: string
    status?: BlogStatus
    tags?: string[]
    coverImageUrl?: string
    coverImageAlt?: string
    isFeatured?: boolean
    publishedAt?: Date
    authorName?: string
}

function trimOptionalString(value: string | undefined): string | undefined {
    if (typeof value !== 'string') {
        return undefined
    }

    return value.trim()
}

// Trims each tag and drops empty strings that result from whitespace-only entries.
function normalizeTags(tags: string[] | undefined): string[] | undefined {
    if (!Array.isArray(tags)) {
        return undefined
    }

    return tags.map(tag => tag.trim()).filter(Boolean)
}

// Accepts absolute http(s) URLs and root-relative paths like /uploads/img.png.
// Rejects arbitrary strings to prevent storing garbage or injection payloads.
function isValidCoverImageUrl(url: string): boolean {
    return url.startsWith('/') || /^https?:\/\//.test(url)
}

// Validates and sanitizes body fields from a create or update request.
// Only fields present in the body are included in the result —
// undefined means "not provided", so the caller can safely spread the result into a $set
// without overwriting unrelated fields.
// Throws an Error (mapped to 400 by callers) for constraint violations.
export function normalizeBlogPostWriteInput(options: NormalizeOptions): NormalizedWriteInput {
    const normalized: NormalizedWriteInput = {}
    const title = trimOptionalString(options.body.title)

    if (options.mode === 'create' && !title) {
        throw new Error('title is required')
    }

    if (typeof options.body.title === 'string') {
        if (!title) {
            throw new Error('title is required')
        }

        normalized.title = title
    }

    if (typeof options.body.markdown === 'string') {
        normalized.rawMarkdown = options.body.markdown
    }

    if (options.body.status === 'draft' || options.body.status === 'published') {
        normalized.status = options.body.status
    } else if (options.mode === 'create') {
        normalized.status = 'draft'
    }

    const tags = normalizeTags(options.body.tags)
    if (Array.isArray(options.body.tags)) {
        normalized.tags = tags || []
    }

    const coverImageUrl = trimOptionalString(options.body.coverImageUrl)
    if (typeof options.body.coverImageUrl === 'string') {
        if (coverImageUrl && !isValidCoverImageUrl(coverImageUrl)) {
            throw new Error('coverImageUrl must be an absolute http(s) URL or a root-relative path')
        }

        normalized.coverImageUrl = coverImageUrl || ''
    }

    if (typeof options.body.coverImageAlt === 'string') {
        normalized.coverImageAlt = trimOptionalString(options.body.coverImageAlt) || ''
    }

    if (typeof options.body.isFeatured === 'boolean') {
        normalized.isFeatured = options.body.isFeatured
    } else if (options.mode === 'create') {
        normalized.isFeatured = false
    }

    if (typeof options.body.authorName === 'string') {
        normalized.authorName = options.body.authorName.trim()
    } else if (options.mode === 'create') {
        normalized.authorName = ''
    }

    // Set publishedAt only on the first publication — once set it should never change
    // so readers and RSS consumers see a stable "originally published" date.
    if (
        normalized.status === 'published' &&
        !options.existingPost?.publishedAt
    ) {
        normalized.publishedAt = options.now
    }

    return normalized
}
