<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <div class="flex items-center justify-between mb-6 flex-wrap gap-2">
            <h1 class="text-2xl font-bold text-accent-primary">Новий пост</h1>
            <MainButton label="До списку" buttonStyle="secondary" size="M" link="/admin/blog" icon="mdi:arrow-left" />
        </div>

        <div class="bg-fill-secondary border border-separator-primary rounded-xl p-4">
            <form class="flex flex-col gap-3" @submit.prevent="createPost">
                <input v-model="form.title" type="text" placeholder="Заголовок"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <select v-model="form.status"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary">
                    <option value="draft">Чернетка</option>
                    <option value="published">Опублікований</option>
                </select>
                <input v-model="form.tagsText" type="text" placeholder="Теги через кому"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <input v-model="form.coverImageUrl" type="text" placeholder="URL обкладинки"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <input v-model="form.coverImageAlt" type="text" placeholder="Alt-текст обкладинки"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <input v-model="form.authorName" type="text" placeholder="Автор"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                <label class="flex items-center gap-2 text-sm text-label-secondary">
                    <input v-model="form.isFeatured" type="checkbox" />
                    Закріплений пост
                </label>
                <textarea v-model="form.markdown" rows="16" placeholder="Markdown"
                    class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary font-mono"></textarea>
                <div class="flex items-center gap-3 flex-wrap">
                    <MainButton type="submit" :disabled="creating">
                        {{ creating ? 'Створення…' : 'Створити' }}
                    </MainButton>
                    <span v-if="error" class="text-red-500">{{ error }}</span>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useRouter, useFetch } from '#imports'
import { ref } from 'vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const router = useRouter()

const { data: profile } = await useFetch<{ username: string }>('/api/profile')

const form = ref({
    title: '',
    markdown: '',
    status: 'draft' as 'draft' | 'published',
    tagsText: '',
    coverImageUrl: '',
    coverImageAlt: '',
    isFeatured: false,
    authorName: profile.value?.username || '',
})

const creating = ref(false)
const error = ref('')

async function createPost() {
    creating.value = true
    error.value = ''
    try {
        const result = await $fetch<{ ok: boolean; slug: string }>('/api/blog', {
            method: 'POST',
            body: {
                title: form.value.title,
                markdown: form.value.markdown,
                status: form.value.status,
                tags: form.value.tagsText.split(',').map(t => t.trim()).filter(Boolean),
                coverImageUrl: form.value.coverImageUrl,
                coverImageAlt: form.value.coverImageAlt,
                isFeatured: form.value.isFeatured,
                authorName: form.value.authorName,
            },
        })
        await router.push(`/admin/blog/${result.slug}`)
    } catch (e: any) {
        error.value = e?.data?.statusMessage || e?.message || 'Помилка створення'
    } finally {
        creating.value = false
    }
}
</script>
