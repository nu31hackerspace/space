import type { ContentBlock } from './types/content'

// Average reading speed used for estimation (words per minute).
const WORDS_PER_MINUTE = 200

// Extracts plain text from a content block for word counting.
// Image and link blocks are skipped — they carry no readable text.
function extractText(block: ContentBlock): string {
    switch (block.type) {
        case 'text':
        case 'quote':
            return block.content
        case 'header':
            return block.title
        case 'list':
            return block.items.join(' ')
        default:
            return ''
    }
}

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length
}

// Returns estimated reading time in minutes (minimum 1).
export function readingTime(blocks: ContentBlock[]): number {
    const totalWords = blocks.reduce((sum, block) => sum + countWords(extractText(block)), 0)
    return Math.max(Math.ceil(totalWords / WORDS_PER_MINUTE), 1)
}
