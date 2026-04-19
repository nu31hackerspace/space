import type { ContentBlock } from '~~/shared/types/content'

// Converts raw markdown text into an array of typed content blocks.
// Each block maps to a specific UI component (header, text, image, link, code, list, quote).
// Inline formatting (bold, italic, code spans, inline links) is intentionally preserved
// as raw text — the TextItem component handles inline rendering.
export function parseMarkdownToBlocks(markdownContent: string): ContentBlock[] {
    const blocks: ContentBlock[] = []
    const lines = (markdownContent || '').split('\n')

    let i = 0

    while (i < lines.length) {
        const line = lines[i]
        const trimmed = line.trim()

        // Skip blank lines — they act as paragraph separators
        if (trimmed === '') {
            i++
            continue
        }

        // Fenced code block: ```[language]
        if (trimmed.startsWith('```')) {
            const language = trimmed.slice(3).trim()
            const codeLines: string[] = []
            i++

            while (i < lines.length && lines[i].trim() !== '```') {
                codeLines.push(lines[i])
                i++
            }

            blocks.push({
                type: 'code',
                code: codeLines.join('\n'),
                language,
            })

            i++ // skip closing ```
            continue
        }

        // ATX header: # ## ### etc.
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/)
        if (headerMatch) {
            blocks.push({
                type: 'header',
                size: String(headerMatch[1].length) as '1' | '2' | '3' | '4' | '5' | '6',
                title: headerMatch[2].trim(),
            })
            i++
            continue
        }

        // Blockquote: > text
        if (trimmed.startsWith('> ')) {
            const content = trimmed.slice(2).trim()
            blocks.push({ type: 'quote', content })
            i++
            continue
        }

        // Unordered list: lines starting with "- "
        if (trimmed.startsWith('- ')) {
            const items: string[] = []

            while (i < lines.length && lines[i].trim().startsWith('- ')) {
                items.push(lines[i].trim().slice(2).trim())
                i++
            }

            blocks.push({ type: 'list', items, ordered: false })
            continue
        }

        // Ordered list: lines starting with "N. "
        if (/^\d+\.\s/.test(trimmed)) {
            const items: string[] = []

            while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^\d+\.\s/, '').trim())
                i++
            }

            blocks.push({ type: 'list', items, ordered: true })
            continue
        }

        // Standalone image: ![alt](url) — must be the only thing on the line
        const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/)
        if (imageMatch) {
            blocks.push({
                type: 'image',
                imageUrl: imageMatch[2],
                imageAlt: imageMatch[1],
            })
            i++
            continue
        }

        // Standalone link: [text](url) — must be the only thing on the line
        const linkMatch = trimmed.match(/^\[([^\]]*)\]\(([^)]+)\)$/)
        if (linkMatch) {
            blocks.push({
                type: 'link',
                linkText: linkMatch[1],
                linkUrl: linkMatch[2],
            })
            i++
            continue
        }

        // Text paragraph: collect consecutive non-blank, non-special lines.
        // Inline markdown is kept as-is for the TextItem component to render.
        const paragraphLines: string[] = []

        while (i < lines.length) {
            const current = lines[i].trim()

            // Stop collecting at blank lines or block-level constructs
            if (
                current === '' ||
                current.startsWith('#') ||
                current.startsWith('```') ||
                current.startsWith('> ') ||
                current.startsWith('- ') ||
                /^\d+\.\s/.test(current)
            ) {
                break
            }

            paragraphLines.push(current)
            i++
        }

        if (paragraphLines.length > 0) {
            blocks.push({ type: 'text', content: paragraphLines.join('\n') })
        }
    }

    return blocks
}
