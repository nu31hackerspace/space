<template>
    <div class="min-h-screen text-label-primary">
        <div class="container mx-auto px-4 py-8">
            <header class="mb-8">
                <h1 class="text-3xl font-bold text-accent-primary mb-2">
                    Мерч
                </h1>
                <p class="text-label-secondary mb-2">
                    Оплата донатом у банку monobank, доставка Новою Поштою.
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
                class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
            >
                <article
                    v-for="product in products"
                    :key="product.slug"
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
                                v-if="product.images.length"
                                :src="product.images[0]"
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
                        {{ formatPrice(product.priceUah) }}
                    </p>

                    <div class="mt-3">
                        <MainButton
                            button-style="primary"
                            size="M"
                            label="Купити"
                            :link="`/merch/${product.slug}`"
                        />
                    </div>
                </article>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { MERCH_PRODUCTS as products, formatPrice } from '~~/shared/merch'

definePageMeta({ layout: 'default' })
</script>
