<template>
    <component :is="headerTag" class="text-accent-primary font-bold" :class="headerClasses">
        {{ title }}
    </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
    title: string
    size: '1' | '2' | '3' | '4' | '5' | '6'
}>(), {
    size: '1'
})

const headerTag = computed(() => `h${props.size}`)

const headerClasses = computed(() => {
    switch (props.size) {
        default:
            return 'text-2xl'
        case '2':
            return 'text-xl'
        case '3':
            return 'text-lg'
        case '4':
            return 'text-base'
        case '5':
            return 'text-sm'
        case '6':
            return 'text-xs'
    }
})
</script>