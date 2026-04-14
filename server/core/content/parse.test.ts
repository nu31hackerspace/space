import { describe, it, expect } from 'vitest'
import { parseMarkdownToBlocks } from './parse'

describe('parseMarkdownToBlocks', () => {
    describe('headers', () => {
        it('parses h1 header', () => {
            const blocks = parseMarkdownToBlocks('# Header 1')
            expect(blocks).toEqual([
                { type: 'header', size: '1', title: 'Header 1' },
            ])
        })

        it('parses h2 header', () => {
            const blocks = parseMarkdownToBlocks('## Header 2')
            expect(blocks).toEqual([
                { type: 'header', size: '2', title: 'Header 2' },
            ])
        })

        it('parses multiple headers', () => {
            const blocks = parseMarkdownToBlocks('# Header 1\n## Header 2')
            expect(blocks).toEqual([
                { type: 'header', size: '1', title: 'Header 1' },
                { type: 'header', size: '2', title: 'Header 2' },
            ])
        })
    })

    describe('text paragraphs', () => {
        it('parses a single paragraph', () => {
            const blocks = parseMarkdownToBlocks('Paragraph 1')
            expect(blocks).toEqual([
                { type: 'text', content: 'Paragraph 1' },
            ])
        })

        it('parses two paragraphs separated by blank line', () => {
            const blocks = parseMarkdownToBlocks('Paragraph 1\n\nParagraph 2')
            expect(blocks).toEqual([
                { type: 'text', content: 'Paragraph 1' },
                { type: 'text', content: 'Paragraph 2' },
            ])
        })

        it('preserves inline markdown in text content for the component to render', () => {
            const blocks = parseMarkdownToBlocks('Text with **bold** and `code`')
            expect(blocks).toEqual([
                { type: 'text', content: 'Text with **bold** and `code`' },
            ])
        })

        it('treats inline links as text content', () => {
            const blocks = parseMarkdownToBlocks('Text with [inline link](url)')
            expect(blocks).toEqual([
                { type: 'text', content: 'Text with [inline link](url)' },
            ])
        })
    })

    describe('images', () => {
        it('parses standalone image as image block', () => {
            const blocks = parseMarkdownToBlocks('![Alt](img.png)')
            expect(blocks).toEqual([
                { type: 'image', imageUrl: 'img.png', imageAlt: 'Alt' },
            ])
        })

        it('parses standalone image with trailing whitespace', () => {
            const blocks = parseMarkdownToBlocks('![Alt](img.png)  ')
            expect(blocks).toEqual([
                { type: 'image', imageUrl: 'img.png', imageAlt: 'Alt' },
            ])
        })
    })

    describe('links', () => {
        it('parses standalone link as link block', () => {
            const blocks = parseMarkdownToBlocks('[Link Text](https://example.com)')
            expect(blocks).toEqual([
                { type: 'link', linkText: 'Link Text', linkUrl: 'https://example.com' },
            ])
        })
    })

    describe('code blocks', () => {
        it('parses fenced code block as code block', () => {
            const blocks = parseMarkdownToBlocks('```\nconst x = 1\n```')
            expect(blocks).toEqual([
                { type: 'code', code: 'const x = 1', language: '' },
            ])
        })

        it('parses fenced code block with language', () => {
            const blocks = parseMarkdownToBlocks('```typescript\nconst x: number = 1\n```')
            expect(blocks).toEqual([
                { type: 'code', code: 'const x: number = 1', language: 'typescript' },
            ])
        })
    })

    describe('lists', () => {
        it('parses unordered list as a list block', () => {
            const blocks = parseMarkdownToBlocks('- item one\n- item two\n- item three')
            expect(blocks).toEqual([
                { type: 'list', items: ['item one', 'item two', 'item three'], ordered: false },
            ])
        })

        it('parses ordered list as a list block', () => {
            const blocks = parseMarkdownToBlocks('1. first\n2. second\n3. third')
            expect(blocks).toEqual([
                { type: 'list', items: ['first', 'second', 'third'], ordered: true },
            ])
        })
    })

    describe('blockquotes', () => {
        it('parses blockquote as a quote block', () => {
            const blocks = parseMarkdownToBlocks('> This is a quote')
            expect(blocks).toEqual([
                { type: 'quote', content: 'This is a quote' },
            ])
        })
    })

    describe('mixed content', () => {
        it('parses a header followed by a paragraph', () => {
            const blocks = parseMarkdownToBlocks('# Title\n\nSome text here.')
            expect(blocks).toEqual([
                { type: 'header', size: '1', title: 'Title' },
                { type: 'text', content: 'Some text here.' },
            ])
        })

        it('handles empty string gracefully', () => {
            const blocks = parseMarkdownToBlocks('')
            expect(blocks).toEqual([])
        })
    })
})
