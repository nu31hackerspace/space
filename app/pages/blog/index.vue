<template>
    <div class="bg-background-primary text-label-primary">
        <section class="border-b border-separator-primary">
            <div class="container mx-auto max-w-4xl px-6 py-8">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <h1 class="text-3xl font-semibold text-accent-primary">
                            Блог
                        </h1>
                        <p class="mt-1 text-sm text-label-tertiary">
                            {{ posts?.length ?? 0 }} публікацій
                        </p>
                    </div>
                    <a
                        href="/rss.xml"
                        class="shrink-0 rounded-full border border-separator-primary px-4 py-1.5 text-sm font-medium transition-colors hover:border-accent-primary hover:bg-fill-secondary"
                    >
                        RSS
                    </a>
                </div>
            </div>
        </section>

        <div class="container mx-auto max-w-4xl px-6 py-10">
            <div
                v-if="posts?.length"
                class="divide-y divide-separator-primary"
            >
                <article
                    v-for="post in posts"
                    :key="post.path"
                    class="py-5"
                >
                    <time
                        :datetime="post.date"
                        class="text-xs text-label-tertiary"
                    >
                        {{ formatDate(post.date) }}
                    </time>
                    <h2 class="mt-1 text-lg font-semibold text-accent-primary">
                        <NuxtLink
                            :to="post.path"
                            class="hover:underline"
                        >
                            {{ post.title }}
                        </NuxtLink>
                    </h2>
                    <p class="mt-1 text-sm leading-6 text-label-secondary">
                        {{ post.description }}
                    </p>
                    <p class="mt-2 text-xs text-label-tertiary">
                        {{ post.author }}
                    </p>
                </article>
            </div>
            <p
                v-else
                class="py-10 text-label-secondary"
            >
                Статей поки немає.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    definePageMeta,
    queryCollection,
    useAsyncData,
    useHead,
} from '#imports'
import { contentDate } from '~~/shared/blog'

definePageMeta({ layout: 'default' })

const { data: posts } = await useAsyncData('published-blog-posts', () =>
    queryCollection('blog').order('date', 'DESC').all()
)

useHead({
    title: 'Блог',
    meta: [
        {
            name: 'description',
            content: 'Новини, проєкти та події київського хакерспейсу NU31.',
        },
    ],
    link: [{ rel: 'canonical', href: 'https://nu31.space/blog/' }],
})

function formatDate(value: string): string {
    return contentDate(value).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
</script>
