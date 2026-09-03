<template>
    <div class="min-h-screen text-label-primary">
        <div class="container mx-auto px-4 py-8 max-w-5xl">
            <NuxtLink
                to="/merch"
                class="text-sm text-label-secondary hover:text-accent-primary transition-colors"
            >
                ← Весь мерч
            </NuxtLink>

            <div
                v-if="pending"
                class="text-label-secondary py-12 text-center"
            >
                Завантаження…
            </div>

            <div
                v-else-if="!product"
                class="text-label-secondary py-12 text-center"
            >
                Такого товару немає.
            </div>

            <article
                v-else
                class="mt-6 flex flex-col md:flex-row gap-8"
            >
                <div class="md:w-1/2 flex flex-col gap-3">
                    <div
                        class="relative aspect-square rounded-xl overflow-hidden bg-fill-tertiary border border-separator-primary"
                    >
                        <img
                            v-if="currentImage"
                            :src="`/api/merch/products/image/${currentImage}`"
                            :alt="`${product.name} — фото ${currentIndex + 1}`"
                            class="w-full h-full object-cover"
                        />

                        <template v-if="images.length > 1">
                            <button
                                type="button"
                                aria-label="Попереднє фото"
                                class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background-primary/80 border border-separator-primary text-label-primary hover:bg-background-primary transition-colors"
                                @click="previous"
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                aria-label="Наступне фото"
                                class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background-primary/80 border border-separator-primary text-label-primary hover:bg-background-primary transition-colors"
                                @click="next"
                            >
                                ›
                            </button>
                            <span
                                class="absolute bottom-2 right-2 px-2 py-1 rounded bg-background-primary/80 border border-separator-primary text-xs text-label-secondary"
                            >
                                {{ currentIndex + 1 }} / {{ images.length }}
                            </span>
                        </template>
                    </div>

                    <div
                        v-if="images.length > 1"
                        class="flex gap-2 overflow-x-auto"
                    >
                        <button
                            v-for="(filename, index) in images"
                            :key="filename"
                            type="button"
                            :class="[
                                'shrink-0 w-16 h-16 rounded-lg overflow-hidden border transition-opacity',
                                index === currentIndex
                                    ? 'border-accent-primary'
                                    : 'border-separator-primary opacity-60 hover:opacity-100',
                            ]"
                            @click="currentIndex = index"
                        >
                            <img
                                :src="`/api/merch/products/image/${filename}`"
                                :alt="`${product.name} — мініатюра ${index + 1}`"
                                loading="lazy"
                                class="w-full h-full object-cover"
                            />
                        </button>
                    </div>
                </div>

                <div class="md:w-1/2 flex flex-col gap-4">
                    <h1 class="text-2xl font-bold text-accent-primary">
                        {{ product.name }}
                    </h1>

                    <p class="text-2xl font-bold text-label-primary">
                        {{ formatPrice(product.priceKopecks) }}
                    </p>

                    <p
                        v-if="product.description"
                        class="text-label-secondary whitespace-pre-line"
                    >
                        {{ product.description }}
                    </p>

                    <MainBadge
                        v-if="!product.isAvailable"
                        variant="error"
                        label="Немає в наявності"
                    />

                    <div v-else>
                        <MainButton
                            button-style="primary"
                            size="L"
                            label="Купити"
                            @click="
                                navigateTo(
                                    `/merch/${route.params.slug}/checkout`
                                )
                            "
                        />
                    </div>

                    <p class="text-xs text-label-tertiary">
                        Доставка Новою Поштою, оплата карткою через monobank.
                    </p>
                </div>
            </article>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useFetch, useRoute, navigateTo } from '#imports'
import { computed, ref } from 'vue'
import type { MerchProduct } from '~~/shared/types/merch'
import { formatPrice } from '~~/shared/merch'

definePageMeta({ layout: 'default' })

const route = useRoute()

const { data, pending } = await useFetch<MerchProduct>(
    () => `/api/merch/products/${route.params.slug}`
)

const product = computed(() => data.value || null)
const images = computed(() => product.value?.imageFilenames || [])

const currentIndex = ref(0)
const currentImage = computed(() => images.value[currentIndex.value] || '')

// Wrapping both ways so the arrows never dead-end on the first or last photo.
function next() {
    currentIndex.value = (currentIndex.value + 1) % images.value.length
}

function previous() {
    currentIndex.value =
        (currentIndex.value - 1 + images.value.length) % images.value.length
}
</script>
