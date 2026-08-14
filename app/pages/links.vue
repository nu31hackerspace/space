<template>
    <div class="container mx-auto px-6 py-16 max-w-4xl">
        <h1 class="text-4xl font-bold mb-4 text-accent-primary">
            Наші ресурси та посилання
        </h1>
        <p class="text-lg text-label-secondary mb-12">
            Всі офіційні посилання HACKER SPACE NU31 в одному місці.
        </p>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-6 text-accent-primary">
                Сервіси
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://wiki.nu31.space/" target="_blank" rel="noopener noreferrer" class="bg-fill-secondary p-6 rounded-xl border border-separator-primary hover:border-accent-primary transition-all duration-200 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                        <Icon icon="mdi:book-open-page-variant" class="text-2xl text-accent-primary" />
                    </div>
                    <div>
                        <h3 class="font-bold text-label-primary text-lg">Wiki</h3>
                        <p class="text-sm text-label-secondary">База знань спільноти</p>
                    </div>
                </a>

                <a href="https://grafana.nu31.space/" target="_blank" rel="noopener noreferrer" class="bg-fill-secondary p-6 rounded-xl border border-separator-primary hover:border-accent-primary transition-all duration-200 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                        <Icon icon="mdi:chart-line" class="text-2xl text-accent-primary" />
                    </div>
                    <div>
                        <h3 class="font-bold text-label-primary text-lg">Grafana</h3>
                        <p class="text-sm text-label-secondary">Моніторинг та дашборди</p>
                    </div>
                </a>
            </div>
        </section>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-6 text-accent-primary">
                Соціальні мережі та акаунти
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="https://discord.gg/X93qAG2jH6" target="_blank" rel="noopener noreferrer" class="bg-fill-secondary p-6 rounded-xl border border-separator-primary hover:border-accent-primary transition-all duration-200 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                        <Icon icon="ic:baseline-discord" class="text-2xl text-accent-primary" />
                    </div>
                    <div>
                        <h3 class="font-bold text-label-primary text-lg">Discord</h3>
                        <p class="text-sm text-label-secondary">Основне місце спілкування</p>
                    </div>
                </a>

                <a href="https://github.com/nu31hackerspace" target="_blank" rel="noopener noreferrer" class="bg-fill-secondary p-6 rounded-xl border border-separator-primary hover:border-accent-primary transition-all duration-200 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                        <Icon icon="mdi:github" class="text-2xl text-accent-primary" />
                    </div>
                    <div>
                        <h3 class="font-bold text-label-primary text-lg">GitHub</h3>
                        <p class="text-sm text-label-secondary">Відкритий вихідний код</p>
                    </div>
                </a>

                <a href="https://www.instagram.com/nu31hackerspace/" target="_blank" rel="noopener noreferrer" class="bg-fill-secondary p-6 rounded-xl border border-separator-primary hover:border-accent-primary transition-all duration-200 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                        <Icon icon="mdi:instagram" class="text-2xl text-accent-primary" />
                    </div>
                    <div>
                        <h3 class="font-bold text-label-primary text-lg">Instagram</h3>
                        <p class="text-sm text-label-secondary">Фото з життя простору</p>
                    </div>
                </a>

                <a href="https://www.linkedin.com/company/nu31/" target="_blank" rel="noopener noreferrer" class="bg-fill-secondary p-6 rounded-xl border border-separator-primary hover:border-accent-primary transition-all duration-200 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                        <Icon icon="mdi:linkedin" class="text-2xl text-accent-primary" />
                    </div>
                    <div>
                        <h3 class="font-bold text-label-primary text-lg">LinkedIn</h3>
                        <p class="text-sm text-label-secondary">Професійна сторінка</p>
                    </div>
                </a>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useHead } from '#imports'
import { Icon } from '@iconify/vue'

definePageMeta({
    layout: 'default',
})

useHead({
    title: 'Links — HACKER SPACE NU31',
    meta: [
        {
            name: 'description',
            content: 'All official links and services for HACKER SPACE NU31.',
        },
    ],
})
</script>
