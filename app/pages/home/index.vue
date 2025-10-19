<template>
    <div class="min-h-screen text-label-primary">
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-4xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NuxtLink
                        to="/karma"
                        class="group bg-fill-secondary p-6 rounded-xl border border-separator-primary hover:border-accent-primary transition-all duration-200 cursor-pointer"
                    >
                        <div class="flex flex-col gap-4">
                            <div
                                class="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary/20 transition-all duration-200"
                            >
                                <Icon
                                    icon="mdi:chart-line"
                                    class="text-2xl text-accent-primary"
                                />
                            </div>
                            <div>
                                <h2
                                    class="text-xl font-bold text-label-primary mb-2"
                                >
                                    Подивитися карму людей
                                </h2>
                                <p class="text-sm text-label-secondary">
                                    Переглянути рейтинг та карму всіх учасників
                                    спільноти
                                </p>
                            </div>
                        </div>
                    </NuxtLink>

                    <NuxtLink
                        to="/design/buttons"
                        class="group bg-fill-secondary p-6 rounded-xl border border-separator-primary hover:border-accent-primary transition-all duration-200 cursor-pointer"
                    >
                        <div class="flex flex-col gap-4">
                            <div
                                class="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary/20 transition-all duration-200"
                            >
                                <Icon
                                    icon="mdi:palette"
                                    class="text-2xl text-accent-primary"
                                />
                            </div>
                            <div>
                                <h2
                                    class="text-xl font-bold text-label-primary mb-2"
                                >
                                    Подивитися на дизайн систему
                                </h2>
                                <p class="text-sm text-label-secondary">
                                    Вивчити компоненти та стилі дизайн системи
                                </p>
                            </div>
                        </div>
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { onMounted } from 'vue'
import { trackEvent } from '~~/app/utils/track'
import { Icon } from '@iconify/vue'

definePageMeta({
    layout: 'default',
})

onMounted(() => {
    trackEvent('page_view', { page: 'home' })
})
</script>
