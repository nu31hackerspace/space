<template>
    <div class="min-h-screen bg-background-primary">
        <div class="container mx-auto px-6 py-16">
            <h1 class="text-4xl font-bold mb-8 text-accent-primary">
                Сторінка показує всі бейджі які є в дизайн системі сайту
            </h1>

            <div class="space-y-12">
                <div v-for="variant in badgeVariants" :key="variant.name" class="space-y-6">
                    <h2 class="text-2xl font-semibold text-accent-primary">
                        {{ variant.label }}
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div v-for="example in badgeExamples" :key="`${variant.name}-${example.label}`" class="p-6">
                            <div class="flex flex-col gap-4">
                                <div class="text-center">
                                    <h3 class="text-lg font-medium mb-2 text-accent-primary">
                                        {{ example.label }}
                                    </h3>
                                    <MainBadge :variant="variant.name" :label="example.text" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-16 p-8 bg-fill-secondary rounded-xl border border-separator-primary">
                <h2 class="text-2xl font-bold mb-6 text-accent-primary">
                    Badge Examples
                </h2>
                <div class="flex flex-wrap gap-4 items-center">
                    <MainBadge variant="info" label="Info Badge" />
                    <MainBadge variant="success" label="Success Badge" />
                    <MainBadge variant="error" label="Error Badge" />
                    <MainBadge variant="info" label="New" />
                    <MainBadge variant="success" label="Active" />
                    <MainBadge variant="error" label="Inactive" />
                    <MainBadge variant="info" label="Pending" />
                    <MainBadge variant="success" label="Completed" />
                    <MainBadge variant="error" label="Failed" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { trackEvent } from '~~/app/utils/track'

onMounted(() => {
    trackEvent('page_view', { page: 'design_sandbox_badges' })
})

const badgeVariants = [
    { name: 'info' as const, label: 'Info' },
    { name: 'success' as const, label: 'Success' },
    { name: 'error' as const, label: 'Error' },
]

const badgeExamples = [
    { label: 'Short Text', text: 'Badge' },
    { label: 'Medium Text', text: 'Status Badge' },
    { label: 'Long Text', text: 'Very Long Badge Text' },
    { label: 'Number', text: '42' },
]
</script>
