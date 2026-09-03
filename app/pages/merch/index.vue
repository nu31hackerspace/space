<template>
    <div class="min-h-screen text-label-primary">
        <div class="container mx-auto px-4 py-8">
            <header class="mb-8">
                <h1 class="text-3xl font-bold text-accent-primary mb-2">
                    Мерч
                </h1>
                <p class="text-label-secondary mb-2">
                    Оплата карткою через monobank, доставка Новою Поштою.
                </p>
                <p class="text-label-secondary max-w-2xl">
                    Це мерч, зроблений резидентами хакерспейсу — це речі, якими
                    ми користуємося самі вдома та в хакерспейсі. Ми раді, що ви
                    вирішили підтримати нас покупкою мерчу: 100% ціни товару
                    йдуть на потреби київського хакерспейсу. І, звісно, це
                    гарний подарунок для ваших друзів та подруг мейкерів.
                </p>
            </header>

            <div
                v-if="pending"
                class="text-label-secondary py-12 text-center"
            >
                Завантаження…
            </div>

            <div
                v-else-if="loadError"
                class="text-red-500 py-12 text-center"
            >
                Не вдалося завантажити товари.
            </div>

            <div
                v-else-if="products.length === 0"
                class="text-label-secondary py-12 text-center"
            >
                Поки що товарів немає.
            </div>

            <div
                v-else
                class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
            >
                <article
                    v-for="product in products"
                    :key="product.id"
                    class="flex flex-col"
                >
                    <NuxtLink
                        :to="`/merch/${product.slug}`"
                        class="group block"
                    >
                        <div
                            class="aspect-square rounded-xl overflow-hidden bg-fill-tertiary border border-separator-primary"
                        >
                            <img
                                v-if="product.imageFilenames.length"
                                :src="`/api/merch/products/image/${product.imageFilenames[0]}`"
                                :alt="product.name"
                                loading="lazy"
                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <h2
                            class="mt-3 font-bold text-label-primary group-hover:text-accent-primary transition-colors"
                        >
                            {{ product.name }}
                        </h2>
                    </NuxtLink>

                    <p class="mt-1 text-lg font-bold text-accent-primary">
                        {{ formatPrice(product.priceKopecks) }}
                    </p>

                    <div class="mt-3">
                        <MainButton
                            button-style="primary"
                            size="M"
                            label="Купити"
                            @click="
                                navigateTo(`/merch/${product.slug}/checkout`)
                            "
                        />
                    </div>
                </article>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useFetch, navigateTo } from '#imports'
import { computed } from 'vue'
import type { MerchProduct } from '~~/shared/types/merch'
import { formatPrice } from '~~/shared/merch'

definePageMeta({ layout: 'default' })

const {
    data,
    pending,
    error: loadError,
} = await useFetch<MerchProduct[]>('/api/merch/products')

const products = computed(() => data.value || [])
</script>
