<template>
    <div class="bg-background-primary">
        <div v-if="pending" class="text-center py-12">
            <p class="text-accent-primary">Завантаження статті...</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
            <p class="text-red-500">Помилка завантаження: {{ error.message }}</p>
        </div>

        <article v-else-if="content">
            <section class="border-b border-separator-primary bg-[radial-gradient(circle_at_top_left,_rgba(0,11,33,0.1),_transparent_48%)]">
                <div class="container mx-auto max-w-5xl px-4 py-14">
                    <NuxtLink to="/blog" class="mb-8 inline-flex text-sm uppercase tracking-[0.2em] text-label-tertiary transition-colors hover:text-accent-primary">
                        ← До блогу
                    </NuxtLink>
                    <!-- Vertical cover image: side by side with header on desktop, stacked on mobile -->
                    <div v-if="content.coverImageUrl && coverIsPortrait" class="flex flex-col md:flex-row items-start gap-8">
                        <div class="flex-1 min-w-0">
                            <p class="mb-4 font-display text-2xl uppercase tracking-[0.25em] text-label-tertiary">Публікація</p>
                            <h1 class="mb-6 text-4xl font-semibold text-accent-primary md:text-6xl">{{ content.title }}</h1>
                            <p v-if="content.summary" class="mb-8 text-lg leading-8 text-label-secondary">{{ content.summary }}</p>
                            <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-label-tertiary">
                                <span>{{ formatDate(content.publishedAt) }}</span>
                                <span v-if="content.updatedAt !== content.publishedAt">Оновлено {{ formatDate(content.updatedAt) }}</span>
                                <span v-if="content.authorName">{{ content.authorName }}</span>
                                <span>~{{ estimatedReadingTime }} хв читання</span>
                                <a href="/rss.xml" class="underline decoration-separator-primary underline-offset-4">RSS</a>
                            </div>
                            <div v-if="content.tags.length" class="mt-8 flex flex-wrap gap-2">
                                <NuxtLink v-for="tag in content.tags" :key="tag" :to="`/blog?tag=${encodeURIComponent(tag)}`"
                                    class="rounded-full border border-separator-primary px-3 py-1 text-xs uppercase tracking-[0.18em] text-label-secondary hover:border-accent-primary hover:text-accent-primary transition-colors">
                                    {{ tag }}
                                </NuxtLink>
                            </div>
                        </div>
                        <div class="shrink-0 mt-2">
                            <img :src="content.coverImageUrl" :alt="content.coverImageAlt || content.title"
                                class="max-h-96 w-auto max-w-xs rounded-[1.5rem] border border-separator-primary object-contain" />
                        </div>
                    </div>

                    <!-- Horizontal cover image: header above, image below full-width -->
                    <div v-else>
                        <div class="max-w-3xl">
                            <p class="mb-4 font-display text-2xl uppercase tracking-[0.25em] text-label-tertiary">Публікація</p>
                            <h1 class="mb-6 text-4xl font-semibold text-accent-primary md:text-6xl">{{ content.title }}</h1>
                            <p v-if="content.summary" class="mb-8 text-lg leading-8 text-label-secondary">{{ content.summary }}</p>
                            <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-label-tertiary">
                                <span>{{ formatDate(content.publishedAt) }}</span>
                                <span v-if="content.updatedAt !== content.publishedAt">Оновлено {{ formatDate(content.updatedAt) }}</span>
                                <span v-if="content.authorName">{{ content.authorName }}</span>
                                <span>~{{ estimatedReadingTime }} хв читання</span>
                                <a href="/rss.xml" class="underline decoration-separator-primary underline-offset-4">RSS</a>
                            </div>
                            <div v-if="content.tags.length" class="mt-8 flex flex-wrap gap-2">
                                <NuxtLink v-for="tag in content.tags" :key="tag" :to="`/blog?tag=${encodeURIComponent(tag)}`"
                                    class="rounded-full border border-separator-primary px-3 py-1 text-xs uppercase tracking-[0.18em] text-label-secondary hover:border-accent-primary hover:text-accent-primary transition-colors">
                                    {{ tag }}
                                </NuxtLink>
                            </div>
                        </div>
                        <div v-if="content.coverImageUrl" class="mt-10 overflow-hidden rounded-[2rem] border border-separator-primary">
                            <img :src="content.coverImageUrl" :alt="content.coverImageAlt || content.title"
                                class="w-full object-cover max-h-[32rem]" />
                        </div>
                    </div>
                </div>
            </section>

            <div class="container mx-auto max-w-4xl px-4 py-12">
                <BlogContentBlocks :blocks="content.blocks" />

                <!-- Prev/next navigation between published posts -->
                <nav v-if="content.prevPost || content.nextPost" class="mt-16 pt-8 border-t border-separator-primary grid grid-cols-2 gap-4">
                    <NuxtLink
                        v-if="content.prevPost"
                        :to="`/blog/${content.prevPost.slug}`"
                        class="group flex flex-col gap-1 p-4 rounded-xl border border-separator-primary hover:border-accent-primary transition-colors"
                    >
                        <span class="text-xs uppercase tracking-[0.2em] text-label-tertiary">← Попередня</span>
                        <span class="text-sm font-medium text-accent-primary group-hover:underline">{{ content.prevPost.title }}</span>
                    </NuxtLink>
                    <div v-else></div>

                    <NuxtLink
                        v-if="content.nextPost"
                        :to="`/blog/${content.nextPost.slug}`"
                        class="group flex flex-col gap-1 p-4 rounded-xl border border-separator-primary hover:border-accent-primary transition-colors text-right"
                    >
                        <span class="text-xs uppercase tracking-[0.2em] text-label-tertiary">Наступна →</span>
                        <span class="text-sm font-medium text-accent-primary group-hover:underline">{{ content.nextPost.title }}</span>
                    </NuxtLink>
                    <div v-else></div>
                </nav>
            </div>
        </article>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { createError, definePageMeta, useFetch, useHead, useRoute, useRuntimeConfig } from '#imports'
import type { ContentResponse } from '~~/shared/types/content'
import { readingTime } from '~~/shared/reading-time'

definePageMeta({ layout: 'default' })

const route = useRoute()
const config = useRuntimeConfig()
const mdFileName = route.params['article_slug'] as string

if (!mdFileName) {
    throw createError({ statusCode: 400, statusMessage: 'Markdown file name is required' })
}

const { data: content, pending, error } = await useFetch<ContentResponse>(`/api/content/${mdFileName}`)

// Set SEO meta tags once the article data is available.
// og:image falls back to empty string when there is no cover image.
useHead(computed(() => {
    if (!content.value) return {}
    const baseUrl = config.public.baseUrl as string
    return {
        title: content.value.title,
        meta: [
            { name: 'description', content: content.value.summary },
            { property: 'og:title', content: content.value.title },
            { property: 'og:description', content: content.value.summary },
            { property: 'og:image', content: content.value.coverImageUrl || '' },
            { property: 'og:url', content: `${baseUrl}/blog/${content.value.slug}` },
            { property: 'og:type', content: 'article' },
        ],
        link: [
            { rel: 'alternate', type: 'application/rss+xml', title: 'NU31 Blog RSS', href: '/rss.xml' },
            { rel: 'canonical', href: `${baseUrl}/blog/${content.value.slug}` },
        ],
    }
}))

// Detect portrait cover image by loading it and checking natural dimensions
const coverIsPortrait = ref(false)
onMounted(() => {
    if (!content.value?.coverImageUrl) return
    const img = new Image()
    img.onload = () => { coverIsPortrait.value = img.naturalHeight >= img.naturalWidth }
    img.src = content.value.coverImageUrl
})

// Estimated reading time is computed from parsed content blocks
const estimatedReadingTime = computed(() => {
    if (!content.value?.blocks) return 1
    return readingTime(content.value.blocks)
})

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
</script>
