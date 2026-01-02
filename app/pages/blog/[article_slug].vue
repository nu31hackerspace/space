<template>
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <div v-if="pending" class="text-center py-12">
            <p class="text-accent-primary">Loading article...</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
            <p class="text-red-500">Error loading article: {{ error.message }}</p>
        </div>

        <div v-else-if="content" class="space-y-4">
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
</template>

<script setup lang="ts">
import { createError, definePageMeta, useFetch, useRoute } from '#imports'
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
</script>
