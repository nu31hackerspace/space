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
                <textarea v-model="summary" rows="3" placeholder="summary"
                    class="w-full p-3 rounded bg-transparent border border-separator-primary text-label-primary"></textarea>
                <input v-model="tagsText" type="text" placeholder="tags, comma separated"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <input v-model="coverImageUrl" type="text" placeholder="cover image url"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <input v-model="coverImageAlt" type="text" placeholder="cover image alt"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <label class="flex items-center gap-2 text-sm text-label-secondary">
                    <input v-model="isFeatured" type="checkbox" />
                    Featured post
                </label>
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
const summary = ref('')
const tagsText = ref('')
const coverImageUrl = ref('')
const coverImageAlt = ref('')
const isFeatured = ref(false)
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
        summary.value = data.value.summary || ''
        // @ts-ignore
        tagsText.value = Array.isArray(data.value.tags) ? data.value.tags.join(', ') : ''
        // @ts-ignore
        coverImageUrl.value = data.value.coverImageUrl || ''
        // @ts-ignore
        coverImageAlt.value = data.value.coverImageAlt || ''
        // @ts-ignore
        isFeatured.value = Boolean(data.value.isFeatured)
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
        body: {
            title: title.value,
            status: status.value,
            summary: summary.value,
            tags: tagsText.value.split(','),
            coverImageUrl: coverImageUrl.value,
            coverImageAlt: coverImageAlt.value,
            isFeatured: isFeatured.value,
            markdown: markdown.value,
        },
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
