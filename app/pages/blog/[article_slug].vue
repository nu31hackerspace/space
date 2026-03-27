<template>
    <div class="bg-background-primary">
        <div v-if="pending" class="text-center py-12">
            <p class="text-accent-primary">Loading article...</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
            <p class="text-red-500">Error loading article: {{ error.message }}</p>
        </div>

        <article v-else-if="content">
            <section class="border-b border-separator-primary bg-[radial-gradient(circle_at_top_left,_rgba(0,11,33,0.1),_transparent_48%)]">
                <div class="container mx-auto max-w-5xl px-4 py-14">
                    <NuxtLink to="/blog" class="mb-8 inline-flex text-sm uppercase tracking-[0.2em] text-label-tertiary transition-colors hover:text-accent-primary">
                        Back to blog
                    </NuxtLink>
                    <div class="max-w-3xl">
                        <p class="mb-4 font-display text-2xl uppercase tracking-[0.25em] text-label-tertiary">Transmission</p>
                        <h1 class="mb-6 text-4xl font-semibold text-accent-primary md:text-6xl">{{ content.title }}</h1>
                        <p v-if="content.summary" class="mb-8 text-lg leading-8 text-label-secondary">{{ content.summary }}</p>
                        <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-label-tertiary">
                            <span>{{ formatDate(content.publishedAt) }}</span>
                            <span v-if="content.updatedAt !== content.publishedAt">Updated {{ formatDate(content.updatedAt) }}</span>
                            <a href="/rss.xml" class="underline decoration-separator-primary underline-offset-4">RSS</a>
                        </div>
                        <div v-if="content.tags.length" class="mt-8 flex flex-wrap gap-2">
                            <span v-for="tag in content.tags" :key="tag"
                                class="rounded-full border border-separator-primary px-3 py-1 text-xs uppercase tracking-[0.18em] text-label-secondary">
                                {{ tag }}
                            </span>
                        </div>
                    </div>
                    <div v-if="content.coverImageUrl" class="mt-10 overflow-hidden rounded-[2rem] border border-separator-primary">
                        <img :src="content.coverImageUrl" :alt="content.coverImageAlt || content.title" class="h-full max-h-[32rem] w-full object-cover" />
                    </div>
                </div>
            </section>

            <div class="container mx-auto max-w-4xl px-4 py-12">
                <div class="space-y-8">
                    <template v-for="(block, index) in content.blocks" :key="index">
                        <BlogHeaderItem v-if="block.type === 'header'" :title="block.title || ''" :size="block.size || '1'" />
                        <BlogTextItem v-else-if="block.type === 'text'" :text="block.content || ''" />
                        <BlogImageItem v-else-if="block.type === 'image'" :image-url="block.imageUrl || ''"
                            :image-alt="block.imageAlt || ''" />
                        <BlogLinkItem v-else-if="block.type === 'link'" :link-url="block.linkUrl || ''"
                            :link-text="block.linkText || ''" />
                        <BlogTagsItem v-else-if="block.type === 'tags'" :tags="block.tags || []" />
                    </template>
                </div>
            </div>
        </article>
        </div>
</template>

<script setup lang="ts">
import { createError, definePageMeta, useFetch, useHead, useRoute } from '#imports'
import type { ContentResponse } from '~~/shared/types/content'

definePageMeta({
    layout: 'default',
})

const route = useRoute()
const mdFileName = route.params['article_slug'] as string

if (!mdFileName) {
    throw createError({
        statusCode: 400,
        statusMessage: 'Markdown file name is required',
    })
}

const { data: content, pending, error } = await useFetch<ContentResponse>(
    `/api/content/${mdFileName}`
)

useHead({
    link: [
        {
            rel: 'alternate',
            type: 'application/rss+xml',
            title: 'NU31 Blog RSS',
            href: '/rss.xml',
        },
    ],
})

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
</script>
