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

export type ContentBlock = HeaderBlock | TextBlock | ImageBlock

export interface ContentResponse {
    blocks: ContentBlock[]
}

