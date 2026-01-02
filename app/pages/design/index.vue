<template>
    <div class="min-h-screen bg-background-primary">
        <div class="container mx-auto px-6 py-16">
            <h1 class="text-4xl font-bold mb-8 text-accent-primary">
                Design System
            </h1>
            <p class="text-xl mb-16 text-accent-primary opacity-80">
                Central hub for all design system components and guidelines.
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Buttons Card -->
                <NuxtLink to="/design/buttons" class="block group h-full">
                    <div
                        class="p-6 bg-fill-secondary rounded-xl border border-separator-primary hover:border-accent-primary transition-colors h-full flex flex-col">
                        <h2
                            class="text-2xl font-semibold mb-4 text-accent-primary group-hover:opacity-80 transition-opacity">
                            Buttons
                        </h2>
                        <div class="flex flex-wrap gap-2 mb-6 pointer-events-none">
                            <MainButton buttonStyle="primary" size="S" label="Primary" />
                            <MainButton buttonStyle="secondary" size="S" label="Secondary" />
                        </div>
                        <p class="text-accent-primary opacity-70 mt-auto">
                            Button styles, sizes, and states.
                        </p>
                    </div>
                </NuxtLink>

                <!-- Badges Card -->
                <NuxtLink to="/design/badges" class="block group h-full">
                    <div
                        class="p-6 bg-fill-secondary rounded-xl border border-separator-primary hover:border-accent-primary transition-colors h-full flex flex-col">
                        <h2
                            class="text-2xl font-semibold mb-4 text-accent-primary group-hover:opacity-80 transition-opacity">
                            Badges
                        </h2>
                        <div class="flex flex-wrap gap-2 mb-6 pointer-events-none">
                            <MainBadge variant="info" label="Info" />
                            <MainBadge variant="success" label="Success" />
                        </div>
                        <p class="text-accent-primary opacity-70 mt-auto">
                            Status indicators and labels.
                        </p>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { trackEvent } from '~~/app/utils/track'

onMounted(() => {
    trackEvent('page_view', { page: 'design_system_index' })
})
</script>
