<template>
    <div class="min-h-screen bg-background-primary">
        <div class="container mx-auto px-4 py-8 max-w-5xl">
            <h1 class="text-3xl font-bold text-accent-primary mb-8">Блог</h1>

            <div v-if="pending" class="text-center py-12">
                <p class="text-label-secondary">Завантаження статей...</p>
            </div>

            <div v-else-if="error" class="text-center py-12">
                <p class="text-red-500">Помилка завантаження: {{ error.message }}</p>
            </div>

            <div v-else-if="articles && articles.items.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <NuxtLink v-for="article in articles.items" :key="article.slug" :to="`/blog/${article.slug}`"
                    class="group bg-fill-secondary border border-separator-primary rounded-xl p-6 hover:border-accent-primary transition-colors">
                    <h2 class="text-xl font-semibold text-accent-primary group-hover:underline mb-3">
                        {{ article.title }}
                    </h2>
                    <p class="text-sm text-label-tertiary">
                        {{ formatDate(article.createdAt) }}
                    </p>
                </NuxtLink>
            </div>

            <div v-else class="text-center py-12">
                <p class="text-label-secondary">Статей поки немає</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useFetch } from '#imports'

definePageMeta({
    layout: 'default',
})

interface ArticleListItem {
    slug: string
    title: string
    createdAt: string
    updatedAt: string
}

interface ArticlesResponse {
    items: ArticleListItem[]
    page: number
    pageSize: number
    total: number
}

const { data: articles, pending, error } = await useFetch<ArticlesResponse>('/api/content')

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
</script>
