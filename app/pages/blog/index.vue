<template>
    <div class="min-h-screen bg-background-primary">
        <section class="border-b border-separator-primary">
            <div class="container mx-auto max-w-6xl px-4 py-8">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-semibold text-accent-primary">Блог NU31</h1>
                        <span class="text-sm text-label-tertiary">{{ articles?.total || 0 }} публікацій</span>
                    </div>
                    <a href="/rss.xml"
                        class="shrink-0 inline-flex items-center rounded-full border border-separator-primary px-4 py-1.5 text-sm font-medium text-label-primary transition-colors hover:border-accent-primary hover:bg-fill-secondary">
                        RSS Feed
                    </a>
                </div>
            </div>
        </section>

        <div v-if="pending" class="text-center py-12">
            <p class="text-label-secondary">Завантаження статей...</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
            <p class="text-red-500">Помилка завантаження: {{ error.message }}</p>
        </div>

        <div v-else-if="articles && articles.items.length > 0" class="container mx-auto max-w-6xl px-4 py-10">
            <!-- Active tag filter indicator with reset button -->
            <div v-if="activeTag" class="mb-6 flex items-center gap-3">
                <span class="text-sm text-label-secondary">Фільтр:</span>
                <span class="rounded-full bg-accent-primary/10 border border-accent-primary/30 px-3 py-1 text-xs uppercase tracking-[0.18em] text-accent-primary">
                    {{ activeTag }}
                </span>
                <button
                    @click="clearTag"
                    class="text-xs text-label-tertiary underline hover:text-accent-primary"
                >Скинути</button>
            </div>

            <div class="divide-y divide-separator-primary">
                <NuxtLink
                    v-for="article in allArticles"
                    :key="article.slug"
                    :to="`/blog/${article.slug}`"
                    :class="['group flex items-start gap-4 py-5 px-3 -mx-3 rounded-xl transition-colors hover:bg-fill-secondary/40', article.isFeatured && !activeTag ? 'bg-fill-secondary/20' : '']"
                >
                    <div v-if="article.coverImageUrl" class="shrink-0">
                        <img :src="article.coverImageUrl" :alt="article.coverImageAlt || article.title"
                            class="w-20 h-14 sm:w-28 sm:h-18 rounded-lg object-cover border border-separator-primary" />
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <p class="text-xs text-label-tertiary shrink-0">{{ formatDate(article.publishedAt) }}</p>
                            <span v-if="article.isFeatured && !activeTag" class="text-xs uppercase tracking-[0.18em] text-label-tertiary">· Закріплено</span>
                        </div>
                        <h2 class="mb-1.5 text-base sm:text-lg font-semibold text-accent-primary group-hover:underline leading-snug">
                            {{ article.title }}
                        </h2>
                        <p v-if="article.authorName" class="mb-1 text-xs text-label-tertiary">{{ article.authorName }}</p>
                        <p class="mb-2 line-clamp-2 text-sm leading-6 text-label-secondary">
                            {{ article.summary }}
                        </p>
                        <div class="flex flex-wrap gap-2">
                            <button
                                v-for="tag in article.tags"
                                :key="tag"
                                @click.prevent.stop="setTag(tag)"
                                class="rounded-full border border-separator-primary px-2.5 py-0.5 text-xs uppercase tracking-[0.15em] text-label-secondary hover:border-accent-primary hover:text-accent-primary transition-colors"
                            >
                                {{ tag }}
                            </button>
                        </div>
                    </div>
                </NuxtLink>
            </div>

            <!-- Pagination controls -->
            <div v-if="articles.total > articles.pageSize" class="mt-10 flex items-center justify-center gap-4">
                <button
                    :disabled="currentPage <= 1"
                    @click="goToPage(currentPage - 1)"
                    class="px-4 py-2 rounded border border-separator-primary text-sm text-label-primary disabled:opacity-40 hover:border-accent-primary transition-colors"
                >← Попередня</button>
                <span class="text-sm text-label-tertiary">{{ currentPage }} / {{ totalPages }}</span>
                <button
                    :disabled="currentPage >= totalPages"
                    @click="goToPage(currentPage + 1)"
                    class="px-4 py-2 rounded border border-separator-primary text-sm text-label-primary disabled:opacity-40 hover:border-accent-primary transition-colors"
                >Наступна →</button>
            </div>
        </div>

        <div v-else class="container mx-auto max-w-6xl px-4 py-20 text-center">
            <p class="mb-3 font-display text-3xl uppercase tracking-[0.2em] text-label-tertiary">Немає сигналу</p>
            <p class="text-label-secondary">
                <template v-if="activeTag">Публікацій з тегом «{{ activeTag }}» не знайдено. <button @click="clearTag" class="underline">Показати всі</button></template>
                <template v-else>Статей поки немає</template>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { definePageMeta, useFetch, useHead, useRoute, useRouter } from '#imports'
import type { ContentListResponse, PublicArticleListItem } from '~~/shared/types/content'

definePageMeta({ layout: 'default' })

useHead({
    link: [{ rel: 'alternate', type: 'application/rss+xml', title: 'NU31 Blog RSS', href: '/rss.xml' }],
})

const route = useRoute()
const router = useRouter()

// Sync page and tag from URL query params so links and browser back/forward work correctly
const currentPage = ref(parseInt(route.query.page as string) || 1)
const activeTag = ref((route.query.tag as string) || '')

const PAGE_SIZE = 10

const fetchQuery = computed(() => {
    const q: Record<string, string> = { page: String(currentPage.value), pageSize: String(PAGE_SIZE) }
    if (activeTag.value) q.tag = activeTag.value
    return q
})

const { data: articles, pending, error, refresh } = await useFetch<ContentListResponse>('/api/content', {
    query: fetchQuery,
})

async function navigate(newPage: number, newTag: string) {
    currentPage.value = newPage
    activeTag.value = newTag
    const query: Record<string, string> = { page: String(newPage) }
    if (newTag) query.tag = newTag
    await router.push({ query })
    await refresh()
}

function goToPage(page: number) {
    navigate(page, activeTag.value)
}

function setTag(tag: string) {
    navigate(1, tag)
}

function clearTag() {
    navigate(1, '')
}

const totalPages = computed(() => {
    if (!articles.value) return 1
    return Math.ceil(articles.value.total / articles.value.pageSize)
})

const allArticles = computed<PublicArticleListItem[]>(() => {
    const items = articles.value?.items || []
    if (activeTag.value) return items
    const featured = items.find(item => item.isFeatured) || items[0] || null
    if (!featured) return items
    return [featured, ...items.filter(item => item.slug !== featured.slug)]
})

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
</script>
