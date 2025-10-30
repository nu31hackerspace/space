<template>
    <p class="mb-4 leading-relaxed text-accent-primary">
        <span v-for="(part, index) in parsedParts" :key="index">
            <template v-if="part.type === 'text'">
                {{ part.content }}
            </template>
            <template v-else-if="part.type === 'bold'">
                <strong class="font-bold">{{ part.content }}</strong>
            </template>
            <template v-else-if="part.type === 'italic'">
                <em class="italic">{{ part.content }}</em>
            </template>
            <template v-else-if="part.type === 'boldItalic'">
                <strong class="font-bold"><em class="italic">{{ part.content }}</em></strong>
            </template>
            <template v-else-if="part.type === 'code'">
                <code class="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-sm font-mono text-accent-primary">
                    {{ part.content }}
                </code>
            </template>
            <template v-else-if="part.type === 'link'">
                <a :href="part.url" class="text-accent-primary underline hover:text-accent-primary/80" target="_blank" rel="noopener noreferrer">
                    {{ part.text }}
                </a>
            </template>
            <template v-else-if="part.type === 'strikethrough'">
                <del class="line-through">{{ part.content }}</del>
            </template>
            <template v-else-if="part.type === 'linebreak'">
                <br />
            </template>
        </span>
    </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    text: string
}>()

interface TextPart {
    type: 'text' | 'bold' | 'italic' | 'boldItalic' | 'code' | 'link' | 'strikethrough' | 'linebreak'
    content?: string
    text?: string
    url?: string
}

const parsedParts = computed((): TextPart[] => {
    const parts: TextPart[] = []
    const text = props.text
    
    if (!text) {
        return parts
    }

    // Helper function to add text part
    const addText = (content: string) => {
        if (content) {
            parts.push({ type: 'text', content })
        }
    }

    // Helper to find all pattern matches with their positions
    const findMatches = (regex: RegExp, type: string) => {
        const matches: Array<{ type: string; start: number; end: number; groups: RegExpMatchArray }> = []
        let match: RegExpExecArray | null
        
        // Reset regex lastIndex
        regex.lastIndex = 0
        
        while ((match = regex.exec(text)) !== null) {
            matches.push({
                type,
                start: match.index,
                end: match.index + match[0].length,
                groups: match
            })
            
            // Prevent infinite loop on zero-length matches
            if (match[0].length === 0) {
                regex.lastIndex++
            }
        }
        
        return matches
    }

    // Find all matches for each pattern type
    // Order matters: process more specific patterns first (e.g., boldItalic before bold/italic)
    const allMatches: Array<{ type: string; start: number; end: number; groups: RegExpMatchArray }> = []
    
    // Bold+Italic (***text*** or ___text___)
    allMatches.push(...findMatches(/(\*\*\*|___)(.+?)\1/g, 'boldItalic'))
    
    // Code (inline code - process first to avoid parsing inside code blocks)
    allMatches.push(...findMatches(/`([^`\n]+)`/g, 'code'))
    
    // Links ([text](url))
    allMatches.push(...findMatches(/\[([^\]]+)\]\(([^)]+)\)/g, 'link'))
    
    // Strikethrough (~~text~~)
    allMatches.push(...findMatches(/~~(.+?)~~/g, 'strikethrough'))
    
    // Bold (**text** or __text__)
    // Note: We check these are not part of boldItalic by processing boldItalic first and filtering overlaps
    allMatches.push(...findMatches(/(\*\*|__)([^*_\n]+?)\1/g, 'bold'))
    
    // Italic (*text* or _text_)
    // Must have word boundary to avoid matching parts of bold or code
    allMatches.push(...findMatches(/(?<![*_])(?<!\w)(\*|_)([^*_\n]+?)\1(?![*_])(?!\w)/g, 'italic'))
    
    // Line breaks (two spaces + newline or double newline)
    allMatches.push(...findMatches(/  \n|\n\n/g, 'linebreak'))

    // Sort matches by position
    allMatches.sort((a, b) => a.start - b.start)

    // Remove overlapping matches (keep the longest match when overlaps occur)
    const filteredMatches: Array<{ type: string; start: number; end: number; groups: RegExpMatchArray }> = []
    for (let i = 0; i < allMatches.length; i++) {
        const current = allMatches[i] as { type: string; start: number; end: number; groups: RegExpMatchArray }
        let shouldAdd = true
        
        // Check if current overlaps with any already filtered match
        for (let j = filteredMatches.length - 1; j >= 0; j--) {
            const existing = filteredMatches[j] as { type: string; start: number; end: number; groups: RegExpMatchArray }
            const overlaps = !(current.end <= existing.start || current.start >= existing.end)
            
            if (overlaps) {
                // If current is longer, replace the existing match
                const currentLength = current.end - current.start
                const existingLength = existing.end - existing.start
                
                if (currentLength > existingLength) {
                    filteredMatches.splice(j, 1)
                } else {
                    // Current is shorter or equal, don't add it
                    shouldAdd = false
                    break
                }
            }
        }
        
        if (shouldAdd) {
            filteredMatches.push(current)
        }
    }
    
    // Re-sort after filtering (positions may have changed)
    filteredMatches.sort((a, b) => a.start - b.start)

    // Build parts array
    let lastPos = 0
    
    for (const match of filteredMatches) {
        // Add text before this match
        if (match.start > lastPos) {
            addText(text.substring(lastPos, match.start))
        }
        
        // Add the matched part
        switch (match.type) {
            case 'boldItalic':
                parts.push({ type: 'boldItalic', content: match.groups[2] })
                break
            case 'bold':
                parts.push({ type: 'bold', content: match.groups[2] })
                break
            case 'italic':
                parts.push({ type: 'italic', content: match.groups[2] })
                break
            case 'code':
                parts.push({ type: 'code', content: match.groups[1] })
                break
            case 'link':
                parts.push({ type: 'link', text: match.groups[1], url: match.groups[2] })
                break
            case 'strikethrough':
                parts.push({ type: 'strikethrough', content: match.groups[1] })
                break
            case 'linebreak':
                parts.push({ type: 'linebreak' })
                break
        }
        
        lastPos = match.end
    }
    
    // Add remaining text
    if (lastPos < text.length) {
        addText(text.substring(lastPos))
    }

    // If no parts were created, add the whole text as plain text
    if (parts.length === 0) {
        parts.push({ type: 'text', content: text })
    }

    return parts
})
</script>

