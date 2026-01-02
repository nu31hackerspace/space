<template>
    <div class="mb-6 flex flex-wrap gap-2">
        <MainBadge v-for="tag in tags" :key="tag" variant="info" :label="tag" />
    </div>
</template>

<script setup lang="ts">
import MainBadge from '~~/app/components/MainBadge.vue'

defineProps<{
    tags: string[]
}>()
</script>
