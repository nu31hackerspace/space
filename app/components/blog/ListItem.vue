<template>
    <component
        :is="ordered ? 'ol' : 'ul'"
        class="pl-6 space-y-1 text-accent-primary"
        :class="ordered ? 'list-decimal' : 'list-disc'"
    >
        <li v-for="(item, index) in items" :key="index" class="leading-relaxed">
            {{ item }}
        </li>
    </component>
</template>

<script setup lang="ts">
defineProps<{
    items: string[]
    ordered: boolean
}>()
</script>
