import type { ContentBlock } from '~~/shared/types/content'

export function parseMarkdownToBlocks(markdownContent: string): ContentBlock[] {
    const blocks: ContentBlock[] = []
    const lines = (markdownContent || '').split('\n')

    let currentTextBlock: string[] = []

    const flushTextBlock = () => {
        if (currentTextBlock.length > 0) {
            const text = currentTextBlock.join(' ').trim()
            if (text) {
                blocks.push({
                    type: 'text',
                    content: text,
                })
            }
            currentTextBlock = []
        }
    }

    for (const line of lines) {
        const trimmedLine = line.trim()

        const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)

        if (headerMatch) {
            flushTextBlock()
            const headerLevel = headerMatch[1].length
            const title = headerMatch[2].trim()
            blocks.push({
                type: 'header',
                size: String(headerLevel) as '1' | '2' | '3' | '4' | '5' | '6',
                title,
            })
        } else {
            const imageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
            if (imageMatch) {
                flushTextBlock()
                const alt = imageMatch[1] || ''
                const url = imageMatch[2] || ''
                blocks.push({
                    type: 'image',
                    imageUrl: url,
                    imageAlt: alt,
                })
            } else {
                if (trimmedLine === '') {
                    flushTextBlock()
                } else {
                    currentTextBlock.push(trimmedLine)
                }
            }
        }
    }

    flushTextBlock()
    return blocks
}


