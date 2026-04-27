<template>
    <div class="max-w-2xl mx-auto my-8 bg-gray-50 rounded-xl shadow p-8 text-lg leading-relaxed text-accent-primary">
        <h1 class="text-2xl font-bold text-center mb-8">
            Нудні але потрібні документи
        </h1>
        <ul class="space-y-4">
            <li v-for="doc in docs" :key="doc.file">
                <a
                    :href="`/legal_docs/${doc.file}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-accent-primary hover:bg-white transition-all group"
                >
                    <span class="text-2xl">📄</span>
                    <span class="group-hover:underline">{{ doc.title }}</span>
                </a>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'

definePageMeta({
    layout: 'doc',
})

const docs = [
    { file: 'statut.pdf', title: 'Статут' },
    { file: 'protokol-1-ustanovchykh-zboriv.pdf', title: 'Протокол 1 установчих зборів' },
    { file: 'dodatok-1-do-protokolu-1-reyestr-osib.pdf', title: 'Додаток 1 до протоколу 1 — реєстр осіб' },
    { file: 'vidomosti-pro-kerivni-orhany.pdf', title: 'Відомості про керівні органи' },
    { file: 'struktura-vlasnosti.pdf', title: 'Структура власності' },
    { file: 'vypyska.pdf', title: 'Виписка' },
]
</script>
