<template>
    <div class="rounded-xl border border-separator-primary bg-fill-secondary overflow-x-auto">
        <div v-if="language" class="px-4 py-2 text-xs uppercase tracking-[0.15em] text-label-tertiary border-b border-separator-primary">
            {{ language }}
        </div>
        <pre class="p-4 text-sm font-mono text-accent-primary leading-relaxed"><code>{{ code }}</code></pre>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    code: string
    language: string
}>()
</script>
