<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <h1 class="text-2xl font-bold text-accent-primary mb-6">Media Posts Admin</h1>

        <div class="grid grid-cols-1 gap-8">
            <div class="bg-fill-secondary border border-separator-primary rounded-xl p-4">
                <h2 class="text-lg font-semibold text-accent-primary mb-4">Add new media post</h2>
                <form class="flex flex-col gap-3" @submit.prevent="createPost">
                    <input v-model="createForm.url" type="url"
                        placeholder="URL to media post (e.g., article, YouTube video, etc.)"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary"
                        required />
                    <MainButton button-style="primary" size="M" :label="creating ? 'Creating…' : 'Create'" />
                </form>
                <p v-if="createError" class="text-red-500 mt-2">{{ createError }}</p>
                <p v-if="createOk" class="text-green-600 mt-2">Created successfully</p>
            </div>
        </div>

        <div class="mt-10 bg-fill-secondary border border-separator-primary rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
                <h2 class="text-lg font-semibold text-accent-primary">Media Posts</h2>
            </div>
            <div v-if="listPending">Loading…</div>
            <div v-else-if="items.length === 0" class="text-label-secondary text-center py-8">
                No media posts yet. Add one above to get started.
            </div>
            <div v-else class="space-y-2">
                <div
                    v-for="item in items"
                    :key="item.id"
                    class="p-3 rounded border border-separator-primary flex flex-wrap gap-2 items-center"
                >
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                        <div
                            v-if="item.imageFilename"
                            class="w-20 h-20 rounded overflow-hidden bg-fill-tertiary flex-shrink-0"
                        >
                            <img
                                :src="`/api/media/image/${item.imageFilename}`"
                                :alt="item.title"
                                class="w-full h-full object-cover"
                            />
                        </div>
                        <div class="flex-1 min-w-0">
                            <div
                                class="font-medium text-accent-primary truncate"
                                :title="item.title"
                            >
                                {{ item.title }}
                            </div>
                            <a
                                :href="item.sourceUrl"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-xs text-label-secondary hover:text-accent-primary truncate block"
                                :title="item.sourceUrl"
                            >
                                {{ item.sourceUrl }}
                            </a>
                            <div class="text-xs text-label-secondary">
                                Created {{ new Date(item.createdAt).toLocaleString() }}
                            </div>
                        </div>
                    </div>
                    <div class="flex-shrink-0 mt-2 sm:mt-0">
                        <MainButton
                            button-style="ghost"
                            size="S"
                            :label="deleting === item.id ? 'Deleting…' : 'Delete'"
                            @click="deleting !== item.id && deletePost(item.id)"
                        />
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

const createForm = ref({ url: '' })
const creating = ref(false)
const createError = ref('')
const createOk = ref(false)

async function createPost() {
    creating.value = true
    createError.value = ''
    createOk.value = false
    try {
        const { data, error } = await useFetch('/api/media', {
            method: 'POST',
            body: createForm.value,
        })
        if (error.value) throw error.value
        createOk.value = true
        createForm.value.url = ''
        await refreshList()
        setTimeout(() => {
            createOk.value = false
        }, 3000)
    } catch (e: any) {
        createError.value = e?.statusMessage || e?.message || 'Failed to create media post'
    } finally {
        creating.value = false
    }
}

const items = ref<
    Array<{
        id: string
        title: string
        sourceUrl: string
        imageFilename: string
        createdAt: string
    }>
>([])
const listPending = ref(false)
const deleting = ref<string | null>(null)

async function refreshList() {
    listPending.value = true
    try {
        const data = await $fetch('/api/media')
        items.value = data || []
    } catch (error) {
        console.error('Failed to refresh media posts list:', error)
    } finally {
        listPending.value = false
    }
}

async function deletePost(id: string) {
    if (!confirm('Are you sure you want to delete this media post?')) {
        return
    }

    deleting.value = id
    try {
        const { error } = await useFetch(`/api/media/${id}`, {
            method: 'DELETE',
        })
        if (error.value) throw error.value
        await refreshList()
    } catch (e: any) {
        alert(e?.statusMessage || e?.message || 'Failed to delete media post')
    } finally {
        deleting.value = null
    }
}

await refreshList()
</script>
