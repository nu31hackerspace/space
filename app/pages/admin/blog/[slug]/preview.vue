<template>
    <div class="bg-background-primary">
        <!-- Preview banner -->
        <div class="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-fill-secondary border-b border-separator-primary">
            <span v-if="data?.status === 'draft'"
                class="text-xs px-2 py-0.5 rounded border border-separator-primary text-label-secondary">
                Чернетка
            </span>
            <div v-else></div>
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
            <section class="border-b border-separator-primary bg-[radial-gradient(circle_at_top_left,_rgba(0,11,33,0.1),_transparent_48%)]">
                <div class="container mx-auto max-w-5xl px-4 py-14">
                    <div v-if="data.coverImageUrl && coverIsPortrait" class="flex flex-col md:flex-row items-start gap-8">
                        <div class="flex-1 min-w-0">
                            <p class="mb-4 font-display text-2xl uppercase tracking-[0.25em] text-label-tertiary">Preview</p>
                            <h1 class="mb-6 text-4xl font-semibold text-accent-primary md:text-6xl">{{ data.title }}</h1>
                            <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-label-tertiary">
                                <span>{{ formatDate(data.publishedAt) }}</span>
                                <span v-if="data.authorName">{{ data.authorName }}</span>
                            </div>
                            <div v-if="data.tags.length" class="mt-8 flex flex-wrap gap-2">
                                <span v-for="tag in data.tags" :key="tag"
                                    class="rounded-full border border-separator-primary px-3 py-1 text-xs uppercase tracking-[0.18em] text-label-secondary">
                                    {{ tag }}
                                </span>
                            </div>
                        </div>
                        <div class="shrink-0 mt-2">
                            <img :src="data.coverImageUrl" :alt="data.coverImageAlt || data.title"
                                class="max-h-96 w-auto max-w-xs rounded-[1.5rem] border border-separator-primary object-contain" />
                        </div>
                    </div>

                    <div v-else>
                        <div class="max-w-3xl">
                            <p class="mb-4 font-display text-2xl uppercase tracking-[0.25em] text-label-tertiary">Preview</p>
                            <h1 class="mb-6 text-4xl font-semibold text-accent-primary md:text-6xl">{{ data.title }}</h1>
                            <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-label-tertiary">
                                <span>{{ formatDate(data.publishedAt) }}</span>
                                <span v-if="data.authorName">{{ data.authorName }}</span>
                            </div>
                            <div v-if="data.tags.length" class="mt-8 flex flex-wrap gap-2">
                                <span v-for="tag in data.tags" :key="tag"
                                    class="rounded-full border border-separator-primary px-3 py-1 text-xs uppercase tracking-[0.18em] text-label-secondary">
                                    {{ tag }}
                                </span>
                            </div>
                        </div>
                        <div v-if="data.coverImageUrl" class="mt-10 overflow-hidden rounded-[2rem] border border-separator-primary">
                            <img :src="data.coverImageUrl" :alt="data.coverImageAlt || data.title"
                                class="w-full object-cover max-h-[32rem]" />
                        </div>
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
import { ref, onMounted } from 'vue'
import type { ContentResponse } from '~~/shared/types/content'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const route = useRoute()
const slug = route.params.slug as string

const { data, pending, error } = await useFetch<ContentResponse>(
    `/api/blog/${encodeURIComponent(slug)}/preview`
)

const coverIsPortrait = ref(false)
onMounted(() => {
    if (data.value?.coverImageUrl) {
        const img = new Image()
        img.onload = () => { coverIsPortrait.value = img.naturalHeight >= img.naturalWidth }
        img.src = data.value.coverImageUrl
    }
})

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
</script>
