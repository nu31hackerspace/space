<template>
    <div class="min-h-screen text-label-primary">
        <div class="container mx-auto px-4 py-8 max-w-5xl">
            <NuxtLink
                to="/merch"
                class="text-sm text-label-secondary hover:text-accent-primary transition-colors"
            >
                ← Весь мерч
            </NuxtLink>

            <article
                v-if="product"
                class="mt-6 flex flex-col md:flex-row gap-8"
            >
                <div class="md:w-1/2 flex flex-col gap-3">
                    <div
                        class="relative aspect-square rounded-xl overflow-hidden bg-fill-tertiary border border-separator-primary"
                    >
                        <img
                            v-if="currentImage"
                            :src="currentImage"
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
                            v-for="(image, index) in images"
                            :key="image"
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
                                :src="image"
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
                        {{ formatPrice(product.priceUah) }}
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

                    <section
                        v-else
                        class="flex flex-col gap-4 bg-fill-secondary border border-separator-primary rounded-xl p-5"
                    >
                        <h2 class="text-lg font-bold text-label-primary">
                            Як замовити
                        </h2>

                        <ol
                            class="list-decimal pl-5 flex flex-col gap-3 text-label-secondary"
                        >
                            <li>
                                Задонать
                                <span class="font-bold text-label-primary">
                                    {{ formatPrice(product.priceUah) }}
                                </span>
                                за 1 штуку в банку monobank. Якщо хочеш кілька,
                                помнож ціну на кількість: за 2 штуки —
                                {{ formatPrice(product.priceUah * 2) }}.
                            </li>
                            <li>
                                У коментарі до донату напиши
                                <span class="text-label-primary">
                                    прізвище та ім'я, номер телефону, місто та
                                    номер відділення Нової Пошти
                                </span>
                                — це потрібно для відправки. Наприклад:
                                <code
                                    class="block mt-2 px-3 py-2 rounded bg-fill-tertiary text-label-primary text-sm break-all"
                                >
                                    {{ DONATION_COMMENT_EXAMPLE }}
                                </code>
                            </li>
                            <li>
                                Ми відправимо замовлення Новою Поштою на вказане
                                відділення.
                            </li>
                        </ol>

                        <MainButton
                            button-style="primary"
                            size="L"
                            :link="MERCH_JAR_URL"
                            icon="mdi:bank"
                            class="justify-center"
                        >
                            Задонатити {{ formatPrice(product.priceUah) }}
                        </MainButton>
                    </section>
                </div>
            </article>
        </div>
    </div>
</template>

<script setup lang="ts">
import { createError, definePageMeta, useRoute } from '#imports'
import { computed, ref } from 'vue'
import {
    DONATION_COMMENT_EXAMPLE,
    MERCH_JAR_URL,
    findMerchProduct,
    formatPrice,
} from '~~/shared/merch'

definePageMeta({ layout: 'default' })

const route = useRoute()

const product = computed(() => findMerchProduct(String(route.params.slug)))

if (!product.value) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
}

const images = computed(() => product.value?.images || [])

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
