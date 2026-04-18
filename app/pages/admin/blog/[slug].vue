<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h1 class="text-2xl font-bold text-accent-primary">Редагування: {{ slug }}</h1>
            <div class="flex items-center gap-3">
                <!-- Link to public page — opens in a new tab so the editor stays open -->
                <NuxtLink
                    :to="`/blog/${slug}`"
                    target="_blank"
                    class="text-sm text-label-secondary underline decoration-separator-primary underline-offset-4 hover:text-accent-primary"
                >
                    Публічна сторінка ↗
                </NuxtLink>
                <MainButton
                    label="До списку"
                    buttonStyle="secondary"
                    size="M"
                    link="/admin/blog"
                    icon="mdi:arrow-left"
                />
            </div>
        </div>

        <div class="bg-fill-secondary border border-separator-primary rounded-xl p-4">
            <div class="grid grid-cols-1 gap-3">
                <input v-model="title" type="text" placeholder="Заголовок"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <select v-model="status"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary">
                    <option value="draft">Чернетка</option>
                    <option value="published">Опублікований</option>
                </select>
                <textarea v-model="summary" rows="3" placeholder="Короткий опис"
                    class="w-full p-3 rounded bg-transparent border border-separator-primary text-label-primary"></textarea>
                <input v-model="tagsText" type="text" placeholder="Теги через кому"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <input v-model="coverImageUrl" type="text" placeholder="URL обкладинки"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <input v-model="coverImageAlt" type="text" placeholder="Alt-текст обкладинки"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <input v-model="authorName" type="text" placeholder="Автор"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <label class="flex items-center gap-2 text-sm text-label-secondary">
                    <input v-model="isFeatured" type="checkbox" />
                    Закріплений пост
                </label>

                <!-- Split-view: textarea on the left, live markdown preview on the right -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <textarea v-model="markdown" rows="24" placeholder="Markdown"
                        class="w-full p-3 rounded bg-transparent border border-separator-primary text-label-primary font-mono"></textarea>
                    <div
                        class="w-full p-3 rounded border border-separator-primary text-label-primary prose prose-invert max-w-none overflow-auto"
                        style="min-height: 12rem"
                        v-html="markdownPreview"
                    ></div>
                </div>

                <div class="flex items-center gap-2 flex-wrap">
                    <MainButton @click="save" :disabled="saving">{{ saving ? 'Збереження…' : 'Зберегти' }}</MainButton>
                    <span v-if="saveMsg" class="text-green-600">{{ saveMsg }}</span>
                    <span v-if="errorMsg" class="text-red-500">{{ errorMsg }}</span>

                    <!-- Delete button with confirmation — only shown after post is loaded -->
                    <MainButton
                        v-if="loaded"
                        buttonStyle="danger"
                        :disabled="deleting"
                        @click="deletePost"
                    >{{ deleting ? 'Видалення…' : 'Видалити пост' }}</MainButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useRoute, useRouter } from '#imports'
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import type { AdminBlogPost } from '~~/shared/types/content'

// marked is used for live markdown preview; imported dynamically to avoid SSR issues.
// marked v18+ uses parse() instead of the default export as a function.
let markedParse: ((src: string) => string) | null = null
import('marked').then(m => { markedParse = m.marked.parse as unknown as (src: string) => string })

definePageMeta({ layout: 'default', middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

const title = ref('')
const status = ref<'draft' | 'published'>('draft')
const summary = ref('')
const tagsText = ref('')
const coverImageUrl = ref('')
const coverImageAlt = ref('')
const isFeatured = ref(false)
const authorName = ref('')
const markdown = ref('')
const saving = ref(false)
const deleting = ref(false)
const saveMsg = ref('')
const errorMsg = ref('')
const loaded = ref(false)

// isDirty tracks whether there are unsaved changes
const isDirty = ref(false)

// Computed live preview — falls back to raw text if marked is not loaded yet
const markdownPreview = computed(() => {
    if (!markdown.value) return ''
    return markedParse ? markedParse(markdown.value) : markdown.value
})

async function load() {
    try {
        const data = await $fetch<AdminBlogPost>(`/api/blog/${encodeURIComponent(slug)}`)
        title.value = data.title || ''
        status.value = data.status || 'draft'
        summary.value = data.summary || ''
        tagsText.value = Array.isArray(data.tags) ? data.tags.join(', ') : ''
        coverImageUrl.value = data.coverImageUrl || ''
        coverImageAlt.value = data.coverImageAlt || ''
        isFeatured.value = Boolean(data.isFeatured)
        authorName.value = data.authorName || ''
        markdown.value = data.rawMarkdown || ''
        loaded.value = true
        isDirty.value = false
    } catch {
        errorMsg.value = 'Помилка завантаження поста'
    }
}

async function save() {
    saving.value = true
    saveMsg.value = ''
    errorMsg.value = ''
    try {
        await $fetch(`/api/blog/${encodeURIComponent(slug)}`, {
            method: 'PUT',
            body: {
                title: title.value,
                status: status.value,
                summary: summary.value,
                tags: tagsText.value.split(','),
                coverImageUrl: coverImageUrl.value,
                coverImageAlt: coverImageAlt.value,
                isFeatured: isFeatured.value,
                authorName: authorName.value,
                markdown: markdown.value,
            },
        })
        saveMsg.value = 'Збережено'
        isDirty.value = false
    } catch (e: any) {
        errorMsg.value = e?.data?.statusMessage || e?.message || 'Помилка збереження'
    } finally {
        saving.value = false
    }
}

async function deletePost() {
    if (!window.confirm(`Видалити пост «${slug}»? Це незворотно.`)) return
    deleting.value = true
    try {
        await $fetch(`/api/blog/${encodeURIComponent(slug)}`, { method: 'DELETE' })
        await router.push('/admin/blog')
    } catch (e: any) {
        errorMsg.value = e?.data?.statusMessage || e?.message || 'Помилка видалення'
    } finally {
        deleting.value = false
    }
}

// Mark as dirty whenever any field changes (watched after initial load)
watch([title, status, summary, tagsText, coverImageUrl, coverImageAlt, isFeatured, authorName, markdown], () => {
    if (loaded.value) isDirty.value = true
})

// Warn the user before leaving with unsaved changes
function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (isDirty.value) {
        event.preventDefault()
    }
}

onMounted(() => window.addEventListener('beforeunload', handleBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', handleBeforeUnload))

await load()
</script>
