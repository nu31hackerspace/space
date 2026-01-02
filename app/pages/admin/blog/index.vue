<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <h1 class="text-2xl font-bold text-accent-primary mb-6">Blog Admin</h1>

        <div class="grid grid-cols-1 gap-8">
            <div class="bg-fill-secondary border border-separator-primary rounded-xl p-4">
                <h2 class="text-lg font-semibold text-accent-primary mb-4">Create new post</h2>
                <form class="flex flex-col gap-3" @submit.prevent="createPost">
                    <input v-model="createForm.title" type="text" placeholder="title"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                    <select v-model="createForm.status"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary">
                        <option value="draft">draft</option>
                        <option value="published">published</option>
                    </select>
                    <textarea v-model="createForm.markdown" rows="8" placeholder="markdown"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary"></textarea>
                    <MainButton type="submit" :disabled="creating">
                        {{ creating ? 'Creating…' : 'Create' }}
                    </MainButton>
                </form>
                <p v-if="createError" class="text-red-500 mt-2">{{ createError }}</p>
                <p v-if="createOk" class="text-green-600 mt-2">Created</p>
            </div>
        </div>

        <div class="mt-10 bg-fill-secondary border border-separator-primary rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
                <h2 class="text-lg font-semibold text-accent-primary">Posts</h2>
            </div>
            <div v-if="listPending">Loading…</div>
            <div v-else class="space-y-2">
                <div v-for="item in items" :key="item.slug"
                    class="p-3 rounded border border-separator-primary flex items-center justify-between">
                    <div>
                        <div class="font-medium text-accent-primary">{{ item.title }} <span
                                class="text-xs px-2 py-0.5 rounded bg-accent-primary/10 ml-2">{{ item.status }}</span>
                        </div>
                        <div class="text-xs text-label-secondary">{{ item.slug }} • updated {{ new
                            Date(item.updatedAt).toLocaleString() }}</div>
                    </div>
                    <NuxtLink class="text-accent-primary underline" :to="`/admin/blog/${item.slug}`">Edit</NuxtLink>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { definePageMeta, useFetch } from '#imports'
import { ref } from 'vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const createForm = ref({ title: '', markdown: '', status: 'draft' as 'draft' | 'published' })
const creating = ref(false)
const createError = ref('')
const createOk = ref(false)

async function createPost() {
    creating.value = true
    createError.value = ''
    createOk.value = false
    try {
        const { data, error } = await useFetch('/api/blog', { method: 'POST', body: createForm.value })
        if (error.value) throw error.value
        createOk.value = true
        await refreshList()
    } catch (e: any) {
        createError.value = e?.statusMessage || 'Failed to create'
    } finally {
        creating.value = false
    }
}

const items = ref<Array<{ slug: string; title: string; status: string; updatedAt: string }>>([])
const listPending = ref(false)

async function refreshList() {
    listPending.value = true
    const { data, error } = await useFetch('/api/blog')
    if (!error.value && data.value) {
        items.value = data.value.items || []
    }
    listPending.value = false
}

await refreshList()

</script>
