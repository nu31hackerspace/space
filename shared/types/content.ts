export interface ContentBlockBase {
    type: string
}

export interface HeaderBlock extends ContentBlockBase {
    type: 'header'
    title: string
    size: '1' | '2' | '3' | '4' | '5' | '6'
}

export interface TextBlock extends ContentBlockBase {
    type: 'text'
    content: string
}

export interface ImageBlock extends ContentBlockBase {
    type: 'image'
    imageUrl: string
    imageAlt?: string
}

export interface LinkBlock extends ContentBlockBase {
    type: 'link'
    linkUrl: string
    linkText: string
}

export interface TagsBlock extends ContentBlockBase {
    type: 'tags'
    tags: string[]
}

export type ContentBlock = HeaderBlock | TextBlock | ImageBlock | LinkBlock | TagsBlock

export interface PublicArticleListItem {
    slug: string
    title: string
    summary: string
    tags: string[]
    coverImageUrl: string
    coverImageAlt: string
    status: 'draft' | 'published'
    isFeatured: boolean
    url: string
    publishedAt: string
    updatedAt: string
}

export interface PublicArticle extends PublicArticleListItem {
    blocks: ContentBlock[]
}

export interface ContentListResponse {
    items: PublicArticleListItem[]
    page: number
    pageSize: number
    total: number
}

export interface ContentResponse {
    slug: string
    title: string
    summary: string
    tags: string[]
    coverImageUrl: string
    coverImageAlt: string
    status: 'draft' | 'published'
    isFeatured: boolean
    url: string
    publishedAt: string
    updatedAt: string
    blocks: ContentBlock[]
}
