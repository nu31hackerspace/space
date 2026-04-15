<template>
    <div class="min-h-screen bg-background-primary">
        <section class="border-b border-separator-primary bg-[radial-gradient(circle_at_top_left,_rgba(0,11,33,0.1),_transparent_45%)]">
            <div class="container mx-auto max-w-6xl px-4 py-16">
                <div class="max-w-3xl">
                    <p class="mb-4 font-display text-2xl uppercase tracking-[0.3em] text-label-tertiary">Transmit</p>
                    <h1 class="mb-6 text-5xl font-semibold text-accent-primary md:text-6xl">Блог NU31</h1>
                    <p class="max-w-2xl text-lg leading-8 text-label-secondary">
                        Публікації про хакерспейс, експерименти, інфраструктуру та все, що ми запускаємо в публічний ефір.
                    </p>
                    <div class="mt-8 flex flex-wrap items-center gap-4">
                        <a href="/rss.xml"
                            class="inline-flex items-center rounded-full border border-separator-primary px-4 py-2 text-sm font-medium text-label-primary transition-colors hover:border-accent-primary hover:bg-fill-secondary">
                            RSS Feed
                        </a>
                        <span class="text-sm text-label-tertiary">{{ articles?.total || 0 }} публікацій</span>
                    </div>
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
            <div class="mb-6 flex items-center justify-between gap-4 flex-wrap">
                <p class="text-sm uppercase tracking-[0.2em] text-label-tertiary">Останні публікації</p>
                <a href="/rss.xml" class="text-sm text-label-secondary underline decoration-separator-primary underline-offset-4">/rss.xml</a>
            </div>

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

            <div v-if="featuredArticle && !activeTag" class="mb-8">
                <NuxtLink :to="`/blog/${featuredArticle.slug}`"
                    class="group grid gap-6 rounded-[2rem] border border-separator-primary bg-fill-secondary/70 p-8 transition-colors hover:border-accent-primary md:grid-cols-[1.4fr_1fr]">
                    <div>
                        <p class="mb-4 text-sm uppercase tracking-[0.2em] text-label-tertiary">Закріплено</p>
                        <h2 class="mb-4 text-3xl font-semibold text-accent-primary md:text-4xl">{{ featuredArticle.title }}</h2>
                        <p class="mb-6 max-w-2xl text-base leading-8 text-label-secondary">{{ featuredArticle.summary }}</p>
                        <div class="mb-6 flex flex-wrap gap-2">
                            <!-- Tags are clickable filters -->
                            <button
                                v-for="tag in featuredArticle.tags"
                                :key="tag"
                                @click.prevent="setTag(tag)"
                                class="rounded-full border border-separator-primary px-3 py-1 text-xs uppercase tracking-[0.18em] text-label-secondary hover:border-accent-primary hover:text-accent-primary transition-colors"
                            >
                                {{ tag }}
                            </button>
                        </div>
                        <p class="text-sm text-label-tertiary">
                            {{ formatDate(featuredArticle.publishedAt) }}
                        </p>
                    </div>
                    <div v-if="featuredArticle.coverImageUrl" class="overflow-hidden rounded-[1.5rem] border border-separator-primary">
                        <img :src="featuredArticle.coverImageUrl" :alt="featuredArticle.coverImageAlt || featuredArticle.title"
                            class="h-full min-h-64 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    </div>
                    <div v-else
                        class="flex min-h-64 items-end rounded-[1.5rem] border border-dashed border-separator-primary bg-[linear-gradient(135deg,_rgba(0,11,33,0.08),_rgba(0,11,33,0.02))] p-6">
                        <p class="font-display text-3xl uppercase tracking-[0.2em] text-label-tertiary">Signal locked</p>
                    </div>
                </NuxtLink>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <NuxtLink v-for="article in regularArticles" :key="article.slug" :to="`/blog/${article.slug}`"
                    class="group rounded-[1.75rem] border border-separator-primary bg-fill-secondary/60 p-6 transition-colors hover:border-accent-primary">
                    <div class="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <p class="mb-3 text-xs uppercase tracking-[0.2em] text-label-tertiary">
                                {{ formatDate(article.publishedAt) }}
                            </p>
                            <h2 class="text-2xl font-semibold text-accent-primary group-hover:underline">
                                {{ article.title }}
                            </h2>
                        </div>
                        <span class="rounded-full border border-separator-primary px-3 py-1 text-xs uppercase tracking-[0.18em] text-label-secondary shrink-0">
                            Читати
                        </span>
                    </div>
                    <p class="mb-5 text-sm leading-7 text-label-secondary">
                        {{ article.summary }}
                    </p>
                    <div class="flex flex-wrap gap-2">
                        <!-- Tags are clickable filters; stop propagation to avoid navigating to article -->
                        <button
                            v-for="tag in article.tags"
                            :key="tag"
                            @click.prevent.stop="setTag(tag)"
                            class="rounded-full bg-background-primary px-3 py-1 text-xs uppercase tracking-[0.18em] text-label-secondary hover:border hover:border-accent-primary hover:text-accent-primary transition-colors"
                        >
                            {{ tag }}
                        </button>
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

function buildQuery() {
    const q: Record<string, string> = { page: String(currentPage.value), pageSize: String(PAGE_SIZE) }
    if (activeTag.value) q.tag = activeTag.value
    return q
}

const { data: articles, pending, error, refresh } = await useFetch<ContentListResponse>('/api/content', {
    query: buildQuery(),
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

const featuredArticle = computed<PublicArticleListItem | null>(() => {
    const items = articles.value?.items || []
    return items.find(item => item.isFeatured) || items[0] || null
})

const regularArticles = computed(() => {
    const items = articles.value?.items || []
    // When a tag filter is active, show all results without pinning the featured post
    if (activeTag.value) return items
    return items.filter(item => item.slug !== featuredArticle.value?.slug)
})

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
</script>
