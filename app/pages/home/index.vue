<template>
    <div class="min-h-screen text-label-primary">
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-4xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NuxtLink v-for="card in cards" :key="card.route" :to="card.route"
                        class="group bg-fill-secondary p-6 rounded-xl border border-separator-primary hover:border-accent-primary transition-all duration-200 cursor-pointer">
                        <div class="flex flex-col gap-4">
                            <div
                                class="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center group-hover:bg-accent-primary/20 transition-all duration-200">
                                <Icon :icon="card.icon" class="text-2xl text-accent-primary" />
                            </div>
                            <div>
                                <h2 class="text-xl font-bold text-label-primary mb-2">
                                    {{ card.title }}
                                </h2>
                                <p class="text-sm text-label-secondary">
                                    {{ card.description }}
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

const cards = [
    {
        route: '/karma',
        icon: 'mdi:chart-line',
        title: 'Подивитися карму людей',
        description: 'Переглянути рейтинг та карму всіх учасників спільноти',
    },
    {
        route: '/design/buttons',
        icon: 'mdi:palette',
        title: 'Подивитися на дизайн систему',
        description: 'Вивчити компоненти та стилі дизайн системи',
    },
    {
        route: '/electricity',
        icon: 'mdi:lightning-bolt',
        title: 'Подивитися електроенергію',
        description: 'Переглянути електроенергію всіх учасників спільноти',
    },
    {
        route: '/admin/blog',
        icon: 'mdi:note-edit',
        title: 'Blog Admin',
        description: 'Create and edit blog articles',
    },
]

onMounted(() => {
    trackEvent('page_view', { page: 'home' })
})
</script>
