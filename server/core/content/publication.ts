import type {
    ContentResponse,
    PublicArticle,
    PublicArticleListItem,
    ContentListResponse,
} from '~~/shared/types/content'
import type { ContentBlock, TextBlock } from '~~/shared/types/content'
import { parseMarkdownToBlocks } from './parse'

export interface BlogPostRecord {
    slug: string
    title: string
    rawMarkdown?: string
    // Pre-parsed blocks stored in DB to avoid re-parsing on every request.
    // When present, these are used directly instead of parsing rawMarkdown again.
    cachedBlocks?: ContentBlock[]
    status?: 'draft' | 'published'
    summary?: string
    tags?: string[]
    coverImageUrl?: string
    coverImageAlt?: string
    isFeatured?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    publishedAt?: Date | string
}

export interface PublicFeedEntry {
    id: string
    title: string
    url: string
    description: string
    publishedAt: string
    updatedAt: string
    categories: string[]
    customFields: Record<string, string>
}

function normalizeDate(value: Date | string | undefined, fallback: Date | string | undefined): string {
    const source = value ?? fallback ?? new Date(0)
    return new Date(source).toISOString()
}

function trimText(value: string | undefined): string {
    return (value || '').trim()
}

function normalizeTags(tags: string[] | undefined): string[] {
    return (tags || [])
        .map(tag => trimText(tag))
        .filter(Boolean)
}

function toAbsoluteUrl(value: string | undefined, baseUrl: string): string {
    const normalizedValue = trimText(value)
    if (!normalizedValue) {
        return ''
    }

    return new URL(normalizedValue, baseUrl).toString()
}

function findFirstParagraph(blocks: ContentBlock[]): string {
    const textBlock = blocks.find((block): block is TextBlock => block.type === 'text')
    return textBlock?.content || ''
}

function removeDuplicatedLeadingTitle(blocks: ContentBlock[], title: string): ContentBlock[] {
    const [firstBlock, ...restBlocks] = blocks

    if (
        firstBlock?.type === 'header' &&
        firstBlock.size === '1' &&
        trimText(firstBlock.title).toLowerCase() === trimText(title).toLowerCase()
    ) {
        return restBlocks
    }

    return blocks
}

function buildSummary(post: BlogPostRecord, blocks: ContentBlock[]): string {
    return trimText(post.summary) || findFirstParagraph(blocks)
}

function buildCommonPublicFields(post: BlogPostRecord, baseUrl: string) {
    // Use pre-parsed cachedBlocks when available to skip redundant markdown parsing
    const parsedBlocks = post.cachedBlocks ?? parseMarkdownToBlocks(post.rawMarkdown || '')
    const blocks = removeDuplicatedLeadingTitle(parsedBlocks, post.title)
    const publishedAt = normalizeDate(post.publishedAt, post.createdAt)
    const updatedAt = normalizeDate(post.updatedAt, post.createdAt)
    const summary = buildSummary(post, blocks)
    const coverImageUrl = toAbsoluteUrl(post.coverImageUrl, baseUrl)

    return {
        blocks,
        slug: post.slug,
        title: trimText(post.title),
        summary,
        tags: normalizeTags(post.tags),
        coverImageUrl,
        coverImageAlt: trimText(post.coverImageAlt),
        status: post.status === 'draft' ? 'draft' : 'published',
        isFeatured: Boolean(post.isFeatured),
        url: new URL(`/blog/${post.slug}`, baseUrl).toString(),
        publishedAt,
        updatedAt,
    }
}

export function buildPublicArticleListItem(post: BlogPostRecord, baseUrl: string): PublicArticleListItem {
    const { blocks: _blocks, ...item } = buildCommonPublicFields(post, baseUrl)
    return item
}

export function buildPublicArticle(post: BlogPostRecord, baseUrl: string): PublicArticle {
    return buildCommonPublicFields(post, baseUrl)
}

export function buildPublicArticleListResponse(
    posts: BlogPostRecord[],
    options: { baseUrl: string; page: number; pageSize: number; total: number }
): ContentListResponse {
    return {
        items: posts
            .filter(post => post.status === 'published')
            .map(post => buildPublicArticleListItem(post, options.baseUrl)),
        page: options.page,
        pageSize: options.pageSize,
        total: options.total,
    }
}

export function buildContentResponse(post: BlogPostRecord, baseUrl: string): ContentResponse {
    return buildPublicArticle(post, baseUrl)
}

export function buildPublicFeedEntry(post: BlogPostRecord, baseUrl: string): PublicFeedEntry {
    const article = buildPublicArticle(post, baseUrl)
    const customFields: Record<string, string> = {}

    if (article.coverImageUrl) {
        customFields.coverImage = article.coverImageUrl
    }

    if (article.coverImageAlt) {
        customFields.coverImageAlt = article.coverImageAlt
    }

    return {
        id: article.url,
        title: article.title,
        url: article.url,
        description: article.summary,
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
        categories: article.tags,
        customFields,
    }
}
