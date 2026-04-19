<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h1 class="text-2xl font-bold text-accent-primary">Редагування: {{ slug }}</h1>
            <div class="flex items-center gap-3">
                <button
                    class="text-sm text-label-secondary underline decoration-separator-primary underline-offset-4 hover:text-accent-primary"
                    @click="saveAndPreview"
                >
                    Переглянути ↗
                </button>
                <NuxtLink
                    v-if="status === 'published'"
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
                <textarea v-model="markdown" rows="32" placeholder="Markdown"
                    class="w-full p-3 rounded bg-transparent border border-separator-primary text-label-primary font-mono"></textarea>

                <div class="flex items-center gap-2 flex-wrap">
                    <MainButton @click="save" :disabled="saving">{{ saving ? 'Збереження…' : 'Зберегти' }}</MainButton>
                    <span v-if="saveMsg" style="color: #4ade80">{{ saveMsg }}</span>
                    <span v-if="errorMsg" style="color: #ef4444">{{ errorMsg }}</span>

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
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { AdminBlogPost } from '~~/shared/types/content'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const slug = route.params.slug as string

const title = ref('')
const status = ref<'draft' | 'published'>('draft')
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
const isDirty = ref(false)

async function load() {
    try {
        const data = await $fetch<AdminBlogPost>(`/api/blog/${encodeURIComponent(slug)}`)
        title.value = data.title || ''
        status.value = data.status || 'draft'
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

async function saveAndPreview() {
    if (isDirty.value) await save()
    window.open(`/admin/blog/${slug}/preview`, '_blank')
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

watch([title, status, tagsText, coverImageUrl, coverImageAlt, isFeatured, authorName, markdown], () => {
    if (loaded.value) isDirty.value = true
})

function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (isDirty.value) {
        event.preventDefault()
    }
}

onMounted(() => window.addEventListener('beforeunload', handleBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', handleBeforeUnload))

await load()
</script>
