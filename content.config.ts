import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
    collections: {
        blog: defineCollection({
            type: 'page',
            source: { include: 'blog/*.md', prefix: '/blog' },
            schema: z.object({
                title: z.string().min(1),
                description: z.string().min(1),
                date: z.string(),
                author: z.string().min(1),
                tags: z.array(z.string().min(1)),
            }),
        }),
    },
})
