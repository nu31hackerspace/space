<template>
    <figure class="mb-4 flex flex-col items-center">
        <img :src="imageUrl" :alt="imageAlt || ''" class="w-full rounded-lg" />
        <figcaption v-if="imageAlt" class="mt-2 text-sm text-accent-secondary text-center italic">
            {{ imageAlt }}
        </figcaption>
    </figure>
</template>

<script setup lang="ts">
const props = defineProps<{
    imageUrl: string
    imageAlt?: string
}>()
</script>
