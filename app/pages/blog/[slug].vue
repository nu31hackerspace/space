<template>
    <article
        v-if="post"
        class="min-h-screen bg-background-primary text-label-primary"
    >
        <div class="mx-auto max-w-3xl px-5 pb-20 pt-8 sm:pt-12">
            <NuxtLink
                to="/blog"
                class="inline-flex text-sm text-label-secondary transition-colors hover:text-accent-primary"
            >
                ← До блогу
            </NuxtLink>

            <header class="mt-8 sm:mt-10">
                <p
                    class="text-xs font-medium uppercase tracking-[0.18em] text-label-tertiary"
                >
                    Блог NU31
                </p>
                <h1
                    class="mt-3 text-3xl font-semibold leading-tight text-accent-primary sm:text-4xl"
                >
                    {{ post.title }}
                </h1>
                <p
                    class="mt-4 text-base leading-7 text-label-secondary sm:text-lg"
                >
                    {{ post.description }}
                </p>
                <div
                    class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-label-secondary"
                >
                    <time :datetime="post.date">
                        {{ formatDate(post.date) }}
                    </time>
                    <span>{{ post.author }}</span>
                </div>
                <div
                    v-if="post.tags.length"
                    class="mt-5 flex flex-wrap gap-2"
                >
                    <span
                        v-for="tag in post.tags"
                        :key="tag"
                        class="rounded-full border border-separator-primary px-3 py-1 text-xs text-label-secondary"
                    >
                        {{ tag }}
                    </span>
                </div>
            </header>

            <ContentRenderer
                :value="post"
                class="blog-content mt-8 border-t border-separator-primary pt-8 sm:mt-10 sm:pt-10"
            />
        </div>
    </article>
</template>

<script setup lang="ts">
import {
    createError,
    definePageMeta,
    queryCollection,
    useAsyncData,
    useHead,
    useRoute,
} from '#imports'
import { contentDate } from '~~/shared/blog'

definePageMeta({ layout: 'default' })

const route = useRoute()
const slug = String(route.params.slug)
const path = `/blog/${slug}`
const { data: post } = await useAsyncData(`blog-post-${slug}`, () =>
    queryCollection('blog').path(path).first()
)

if (!post.value) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

useHead({
    title: `${post.value.title} — Блог NU31`,
    meta: [
        { name: 'description', content: post.value.description },
        { property: 'og:title', content: post.value.title },
        { property: 'og:description', content: post.value.description },
        { property: 'og:url', content: `https://nu31.space${path}/` },
        { property: 'og:type', content: 'article' },
    ],
    link: [{ rel: 'canonical', href: `https://nu31.space${path}/` }],
})

function formatDate(value: string): string {
    return contentDate(value).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}
</script>

<style>
.blog-content {
    font-size: 1.0625rem;
    line-height: 1.85;
    overflow-wrap: anywhere;
}
.blog-content > * + * {
    margin-top: 1.5rem;
}
.blog-content h2,
.blog-content h3 {
    font-weight: 700;
    color: var(--color-accent-primary);
    margin-top: 2.5rem;
}
.blog-content h2 {
    font-size: 1.5rem;
}
.blog-content h3 {
    font-size: 1.2rem;
}
.blog-content a {
    color: var(--color-accent-primary);
    text-decoration: underline;
}
.blog-content ul {
    list-style: disc;
    padding-left: 1.5rem;
}
.blog-content ol {
    list-style: decimal;
    padding-left: 1.5rem;
}
.blog-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.75rem;
}
.blog-content pre {
    overflow-x: auto;
    padding: 1rem;
    border-radius: 0.75rem;
    background: var(--color-fill-secondary);
}
.blog-content blockquote {
    padding-left: 1rem;
    border-left: 3px solid var(--color-separator-primary);
    color: var(--color-label-secondary);
}
</style>
