<template>
    <a :href="sourceUrl" target="_blank" rel="noopener noreferrer"
        class="block bg-fill-secondary rounded-xl border border-separator-primary overflow-hidden hover:border-accent-primary transition-colors cursor-pointer group">
        <div class="aspect-video w-full overflow-hidden bg-fill-tertiary">
            <img v-if="imageUrl" :src="imageUrl" :alt="title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div v-else class="w-full h-full flex items-center justify-center text-label-secondary">
                <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        </div>
        <div class="p-4">
            <h3
                class="text-lg font-semibold text-label-primary line-clamp-2 group-hover:text-accent-primary transition-colors">
                {{ title }}
            </h3>
        </div>
    </a>
</template>

<script setup lang="ts">
interface Props {
    title: string
    sourceUrl: string
    imageUrl?: string
}

defineProps<Props>()
</script>
