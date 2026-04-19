<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <div class="flex items-center justify-between mb-6 flex-wrap gap-2">
            <h1 class="text-2xl font-bold text-accent-primary">Адмінка блогу</h1>
            <MainButton label="Створити публікацію" size="M" link="/admin/blog/new" icon="mdi:plus" />
        </div>

        <div class="bg-fill-secondary border border-separator-primary rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
                <h2 class="text-lg font-semibold text-accent-primary">Пости</h2>
            </div>
            <div v-if="listPending">Завантаження…</div>
            <div v-else class="space-y-2">
                <div v-for="item in items" :key="item.slug"
                    class="p-3 rounded border border-separator-primary flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <div class="font-medium text-accent-primary">
                            {{ item.title }}
                            <span class="text-xs px-2 py-0.5 rounded bg-accent-primary/10 ml-2">{{ item.status }}</span>
                        </div>
                        <div class="text-xs text-label-secondary">
                            {{ item.slug }} • оновлено {{ new Date(item.updatedAt).toLocaleString('uk-UA') }}
                            <span v-if="item.views !== undefined"> • {{ item.views }} переглядів</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <NuxtLink
                            v-if="item.status === 'published'"
                            :to="`/blog/${item.slug}`"
                            target="_blank"
                            class="text-xs text-label-secondary underline decoration-separator-primary underline-offset-2 hover:text-accent-primary"
                        >Публічна ↗</NuxtLink>
                        <NuxtLink
                            v-else
                            :to="`/admin/blog/${item.slug}/preview`"
                            target="_blank"
                            class="text-xs text-label-secondary underline decoration-separator-primary underline-offset-2 hover:text-accent-primary"
                        >Preview ↗</NuxtLink>
                        <NuxtLink class="text-accent-primary underline text-sm" :to="`/admin/blog/${item.slug}`">Редагувати</NuxtLink>
                        <button
                            @click="deletePost(item.slug)"
                            class="text-xs font-medium"
                            style="color: #ef4444"
                        >Видалити</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { ref } from 'vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

async function deletePost(slug: string) {
    if (!window.confirm(`Видалити пост «${slug}»? Це незворотно.`)) return
    try {
        await $fetch(`/api/blog/${encodeURIComponent(slug)}`, { method: 'DELETE' })
        await refreshList()
    } catch (e: any) {
        alert(e?.data?.statusMessage || e?.message || 'Помилка видалення')
    }
}

const items = ref<Array<{ slug: string; title: string; status: string; updatedAt: string; views?: number }>>([])
const listPending = ref(false)

async function refreshList() {
    listPending.value = true
    try {
        const data = await $fetch<any>('/api/blog')
        items.value = data?.items || []
    } catch {
        // ignore
    }
    listPending.value = false
}

await refreshList()
</script>
