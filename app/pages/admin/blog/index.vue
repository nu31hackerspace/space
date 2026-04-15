<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <h1 class="text-2xl font-bold text-accent-primary mb-6">Адмінка блогу</h1>

        <div class="grid grid-cols-1 gap-8">
            <div class="bg-fill-secondary border border-separator-primary rounded-xl p-4">
                <h2 class="text-lg font-semibold text-accent-primary mb-4">Новий пост</h2>
                <form class="flex flex-col gap-3" @submit.prevent="createPost">
                    <input v-model="createForm.title" type="text" placeholder="Заголовок"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                    <select v-model="createForm.status"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary">
                        <option value="draft">Чернетка</option>
                        <option value="published">Опублікований</option>
                    </select>
                    <textarea v-model="createForm.summary" rows="3" placeholder="Короткий опис"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary"></textarea>
                    <input v-model="createForm.tagsText" type="text" placeholder="Теги через кому"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                    <input v-model="createForm.coverImageUrl" type="text" placeholder="URL обкладинки"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                    <input v-model="createForm.coverImageAlt" type="text" placeholder="Alt-текст обкладинки"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                    <label class="flex items-center gap-2 text-sm text-label-secondary">
                        <input v-model="createForm.isFeatured" type="checkbox" />
                        Закріплений пост
                    </label>
                    <textarea v-model="createForm.markdown" rows="8" placeholder="Markdown"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary"></textarea>
                    <MainButton type="submit" :disabled="creating">
                        {{ creating ? 'Створення…' : 'Створити' }}
                    </MainButton>
                </form>
                <p v-if="createError" class="text-red-500 mt-2">{{ createError }}</p>
                <p v-if="createOk" class="text-green-600 mt-2">Створено</p>
            </div>
        </div>

        <div class="mt-10 bg-fill-secondary border border-separator-primary rounded-xl p-4">
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
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <!-- Link to public page for quick preview -->
                        <NuxtLink
                            :to="`/blog/${item.slug}`"
                            target="_blank"
                            class="text-xs text-label-secondary underline decoration-separator-primary underline-offset-2 hover:text-accent-primary"
                        >Публічна ↗</NuxtLink>
                        <NuxtLink class="text-accent-primary underline text-sm" :to="`/admin/blog/${item.slug}`">Редагувати</NuxtLink>
                        <button
                            @click="deletePost(item.slug)"
                            class="text-xs text-red-500 hover:text-red-400 underline"
                        >Видалити</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useFetch } from '#imports'
import { ref } from 'vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

// Initial empty state for the create form — reused after successful creation
function emptyForm() {
    return {
        title: '',
        markdown: '',
        status: 'draft' as 'draft' | 'published',
        summary: '',
        tagsText: '',
        coverImageUrl: '',
        coverImageAlt: '',
        isFeatured: false,
    }
}

const createForm = ref(emptyForm())
const creating = ref(false)
const createError = ref('')
const createOk = ref(false)

async function createPost() {
    creating.value = true
    createError.value = ''
    createOk.value = false
    try {
        const { error } = await useFetch('/api/blog', {
            method: 'POST',
            body: {
                title: createForm.value.title,
                markdown: createForm.value.markdown,
                status: createForm.value.status,
                summary: createForm.value.summary,
                tags: createForm.value.tagsText.split(','),
                coverImageUrl: createForm.value.coverImageUrl,
                coverImageAlt: createForm.value.coverImageAlt,
                isFeatured: createForm.value.isFeatured,
            },
        })
        if (error.value) throw error.value
        createOk.value = true
        // Reset form to empty state after successful creation
        createForm.value = emptyForm()
        await refreshList()
    } catch (e: any) {
        createError.value = e?.statusMessage || 'Помилка створення'
    } finally {
        creating.value = false
    }
}

async function deletePost(slug: string) {
    if (!window.confirm(`Видалити пост «${slug}»? Це незворотно.`)) return
    const { error } = await useFetch(`/api/blog/${encodeURIComponent(slug)}`, { method: 'DELETE' })
    if (error.value) {
        alert(error.value.statusMessage || 'Помилка видалення')
    } else {
        await refreshList()
    }
}

const items = ref<Array<{ slug: string; title: string; status: string; updatedAt: string }>>([])
const listPending = ref(false)

async function refreshList() {
    listPending.value = true
    const { data, error } = await useFetch('/api/blog')
    if (!error.value && data.value) {
        items.value = (data.value as any).items || []
    }
    listPending.value = false
}

await refreshList()
</script>
