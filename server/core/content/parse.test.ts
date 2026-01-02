import { describe, it, expect } from 'vitest'
import { parseMarkdownToBlocks } from './parse'

describe('Markdown Parser', () => {
    it('should parse headers', () => {
        const markdown = '# Header 1\n## Header 2'
        const blocks = parseMarkdownToBlocks(markdown)

        expect(blocks).toEqual([
            { type: 'header', size: '1', title: 'Header 1' },
            { type: 'header', size: '2', title: 'Header 2' }
        ])
    })

    it('should parse text paragraphs', () => {
        const markdown = 'Paragraph 1\n\nParagraph 2'
        const blocks = parseMarkdownToBlocks(markdown)

        expect(blocks).toEqual([
            { type: 'text', content: 'Paragraph 1' },
            { type: 'text', content: 'Paragraph 2' }
        ])
    })

    it('should parse block images', () => {
        const markdown = '![Alt](img.png)'
        const blocks = parseMarkdownToBlocks(markdown)

        expect(blocks).toEqual([
            { type: 'image', imageUrl: 'img.png', imageAlt: 'Alt' }
        ])
    })

    it('should parse block images with trailing whitespace', () => {
        const markdown = '![Alt](img.png)  '
        const blocks = parseMarkdownToBlocks(markdown)

        expect(blocks).toEqual([
            { type: 'image', imageUrl: 'img.png', imageAlt: 'Alt' }
        ])
    })

    it('should parse standalone links as link blocks', () => {
        const markdown = '[Link Text](https://example.com)'
        const blocks = parseMarkdownToBlocks(markdown)

        expect(blocks).toEqual([
            { type: 'link', linkText: 'Link Text', linkUrl: 'https://example.com' }
        ])
    })

    it('should treat inline links as text', () => {
        const markdown = 'Text with [inline link](url)'
        const blocks = parseMarkdownToBlocks(markdown)

        expect(blocks).toEqual([
            { type: 'text', content: 'Text with [inline link](url)' }
        ])
    })

    it('should treat inline images as text', () => {
        const markdown = 'Text with ![inline image](img.png)'
        const blocks = parseMarkdownToBlocks(markdown)

    })

    it('should parse tags block', () => {
        const markdown = '---\ntags:\n  - tag1\n  - tag2\n---'
        const blocks = parseMarkdownToBlocks(markdown)

        expect(blocks).toEqual([
            { type: 'tags', tags: ['tag1', 'tag2'] }
        ])
    })
})
