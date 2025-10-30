<template>
    <div class="mb-4 flex justify-center">
        <img 
            :src="imageUrl" 
            :alt="imageAlt || ''" 
            class="w-full rounded-lg"
        />
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    imageUrl: string
    imageAlt?: string
}>()
</script>

