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

function normalizeTags(tags: string[] | undefined): string[] | undefined {
    if (!Array.isArray(tags)) {
        return undefined
    }

    return tags.map(tag => tag.trim()).filter(Boolean)
}

function isValidCoverImageUrl(url: string): boolean {
    return url.startsWith('/') || /^https?:\/\//.test(url)
}

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

    if (
        normalized.status === 'published' &&
        !options.existingPost?.publishedAt &&
        options.mode === 'create'
    ) {
        normalized.publishedAt = options.now
    }

    if (
        normalized.status === 'published' &&
        !options.existingPost?.publishedAt &&
        options.mode === 'update'
    ) {
        normalized.publishedAt = options.now
    }

    return normalized
}
