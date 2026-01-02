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

    let inTagsBlock = false
    let currentTags: string[] = []

    for (const line of lines) {
        const trimmedLine = line.trim()

        if (trimmedLine === '---') {
            flushTextBlock()
            if (inTagsBlock) {
                // End of tags block
                if (currentTags.length > 0) {
                    blocks.push({
                        type: 'tags',
                        tags: currentTags
                    })
                }
                currentTags = []
                inTagsBlock = false
            } else {
                // Start of tags block (potentially)
                // We assume if we see --- it might be tags. 
                // But we need to ensure we don't treat HRs as tags start if we are not expecting it.
                // For this simple implementation, we toggle mode.
                inTagsBlock = true
            }
            continue
        }

        if (inTagsBlock) {
            // Simple parser for tags:
            // tags:
            //   - tag1
            //   - tag2
            if (trimmedLine === 'tags:') continue
            if (trimmedLine.startsWith('- ')) {
                currentTags.push(trimmedLine.substring(2).trim())
            }
            continue
        }

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
            const imageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/)
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
                const linkMatch = trimmedLine.match(/^\[([^\]]*)\]\(([^)]+)\)$/)
                if (linkMatch) {
                    flushTextBlock()
                    const text = linkMatch[1] || ''
                    const url = linkMatch[2] || ''
                    blocks.push({
                        type: 'link',
                        linkUrl: url,
                        linkText: text,
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
    }

    flushTextBlock()
    return blocks
}


