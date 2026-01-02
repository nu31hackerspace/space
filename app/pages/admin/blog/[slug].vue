<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <div class="flex items-center justify-between mb-4">
            <h1 class="text-2xl font-bold text-accent-primary">Edit: {{ slug }}</h1>
            <MainButton
                label="Back to list"
                buttonStyle="secondary"
                size="M"
                link="/admin/blog"
                icon="mdi:arrow-left"
            />
        </div>

        <div class="bg-fill-secondary border border-separator-primary rounded-xl p-4">
            <div class="grid grid-cols-1 gap-3">
                <input v-model="title" type="text" placeholder="title"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <select v-model="status"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary">
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                </select>
                <textarea v-model="markdown" rows="24" placeholder="markdown"
                    class="w-full p-3 rounded bg-transparent border border-separator-primary text-label-primary font-mono"></textarea>
                <div class="flex items-center gap-2">
                    <MainButton @click="save" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</MainButton>
                    <span v-if="saveMsg" class="text-green-600">{{ saveMsg }}</span>
                    <span v-if="errorMsg" class="text-red-500">{{ errorMsg }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useFetch, useRoute } from '#imports'
import { ref } from 'vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const route = useRoute()
const slug = route.params.slug as string

const title = ref('')
const status = ref<'draft' | 'published'>('draft')
const markdown = ref('')
const saving = ref(false)
const saveMsg = ref('')
const errorMsg = ref('')

async function load() {
    const { data, error } = await useFetch(`/api/blog/${encodeURIComponent(slug)}`)
    if (!error.value && data.value) {
        // @ts-ignore
        title.value = data.value.title || ''
        // @ts-ignore
        status.value = data.value.status || 'draft'
        // @ts-ignore
        markdown.value = data.value.rawMarkdown || ''
    }
}

async function save() {
    saving.value = true
    saveMsg.value = ''
    errorMsg.value = ''
    const { error } = await useFetch(`/api/blog/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        body: { title: title.value, status: status.value, markdown: markdown.value },
    })
    saving.value = false
    if (error.value) {
        // @ts-ignore
        errorMsg.value = error.value.statusMessage || 'Failed to save'
    } else {
        saveMsg.value = 'Saved'
    }
}

await load()
</script>
