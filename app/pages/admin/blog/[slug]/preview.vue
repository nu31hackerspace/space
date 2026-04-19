<template>
    <div class="bg-background-primary min-h-screen">
        <!-- Preview banner -->
        <div class="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-fill-secondary border-b border-separator-primary">
            <div class="flex items-center gap-3">
                <span class="text-xs font-mono uppercase tracking-[0.2em] text-accent-primary">PREVIEW</span>
                <span v-if="data?.status === 'draft'"
                    class="text-xs px-2 py-0.5 rounded border border-separator-primary text-label-secondary">
                    Чернетка
                </span>
            </div>
            <NuxtLink
                :to="`/admin/blog/${slug}`"
                class="text-sm text-label-secondary underline decoration-separator-primary underline-offset-4 hover:text-accent-primary"
            >← До редактора</NuxtLink>
        </div>

        <div v-if="pending" class="text-center py-12">
            <p class="text-accent-primary">Завантаження…</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
            <p class="text-label-secondary">Помилка завантаження: {{ error.message }}</p>
        </div>

        <article v-else-if="data">
            <section class="border-b border-separator-primary">
                <div class="container mx-auto max-w-5xl px-4 py-14">
                    <h1 class="mb-6 text-4xl font-semibold text-accent-primary md:text-6xl">
                        {{ data.title }}
                    </h1>
                    <p v-if="data.excerpt" class="mb-8 text-lg leading-8 text-label-secondary">{{ data.excerpt }}</p>
                    <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-label-tertiary">
                        <span>{{ formatDate(data.publishedAt) }}</span>
                        <span v-if="data.authorName">{{ data.authorName }}</span>
                    </div>
                    <div v-if="data.coverImageUrl" class="mt-10 overflow-hidden rounded-[2rem] border border-separator-primary">
                        <img :src="data.coverImageUrl" :alt="data.coverImageAlt || data.title"
                            class="w-full object-cover max-h-[32rem]" />
                    </div>
                </div>
            </section>

            <div class="container mx-auto max-w-4xl px-4 py-12">
                <BlogContentBlocks :blocks="data.blocks" />
            </div>
        </article>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useFetch, useRoute } from '#imports'
import type { ContentResponse } from '~~/shared/types/content'

definePageMeta({ layout: false, middleware: ['auth'] })

const route = useRoute()
const slug = route.params.slug as string

const { data, pending, error } = await useFetch<ContentResponse>(
    `/api/blog/${encodeURIComponent(slug)}/preview`
)

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
</script>
