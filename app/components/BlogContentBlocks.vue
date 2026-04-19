<template>
    <div class="space-y-8">
        <template v-for="(block, index) in blocks" :key="index">
            <BlogHeaderItem v-if="block.type === 'header'" :title="block.title || ''" :size="block.size || '1'" />
            <BlogTextItem v-else-if="block.type === 'text'" :text="block.content || ''" />
            <BlogImageItem v-else-if="block.type === 'image'" :image-url="block.imageUrl || ''"
                :image-alt="block.imageAlt || ''" />
            <BlogLinkItem v-else-if="block.type === 'link'" :link-url="block.linkUrl || ''"
                :link-text="block.linkText || ''" />
            <BlogTagsItem v-else-if="block.type === 'tags'" :tags="block.tags || []" />
            <BlogCodeItem v-else-if="block.type === 'code'" :code="block.code || ''" :language="block.language || ''" />
            <BlogListItem v-else-if="block.type === 'list'" :items="block.items || []" :ordered="block.ordered || false" />
            <BlogQuoteItem v-else-if="block.type === 'quote'" :content="block.content || ''" />
        </template>
    </div>
</template>

<script setup lang="ts">
import type { ContentBlock } from '~~/shared/types/content'

defineProps<{ blocks: ContentBlock[] }>()
</script>
