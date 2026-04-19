<template>
    <blockquote class="border-l-4 border-accent-primary pl-4 italic text-label-secondary leading-relaxed">
        {{ content }}
    </blockquote>
</template>

<script setup lang="ts">
defineProps<{
    content: string
}>()
</script>
