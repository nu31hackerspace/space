<template>
    <div class="min-h-screen bg-background-primary text-label-primary">
        <div
            class="container mx-auto px-4 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
            <div class="w-full sm:w-auto"></div>

            <div
                class="flex w-full sm:w-auto items-center justify-end gap-4 flex-row"
            >
                <ThemeSwitch />
            </div>
        </div>

        <div class="relative w-full">
            <div class="w-full h-full"></div>
            <div class="w-full aspect-[1920/1080] relative">
                <div
                    class="w-full h-full absolute inset-0 z-20 flex items-center text-center justify-center"
                >
                    <span class="text-8xl font-wallpoet text-accent-primary">
                        NU31HACKERSPACE
                    </span>
                </div>
            </div>
        </div>

        <div class="container mx-auto px-6 py-16">
            <div class="max-w-4xl mx-auto text-center mb-20">
                <h2 class="text-4xl font-bold mb-8 text-accent-primary">
                    Хакерспейс у Києві
                </h2>
                <h3 class="text-2xl font-bold mb-8 text-accent-primary">
                    Create whatever you want
                </h3>
                <p class="text-xl text-label-secondary mb-4">
                    NU31 — це простір для творчих людей, інноваторів та
                    ентузіастів технологій. Ми створюємо середовище, де можна
                    експериментувати, навчатися та реалізовувати найсміливіші
                    ідеї.
                </p>
                <p class="text-sm text-label-tertiary">
                    HACKER SPACE NU31 — registered nonprofit organization
                    (громадська організація) in Ukraine, EDRPOU 46237412.
                </p>
            </div>

            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
            >
                <div
                    class="bg-fill-secondary p-8 rounded-xl border border-separator-primary"
                >
                    <div
                        class="w-16 h-16 bg-accent-primary rounded-full flex items-center justify-center mb-6 mx-auto"
                    >
                        <svg
                            class="w-8 h-8 text-background-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            ></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-4 text-center">
                        Творчість та Інновації
                    </h3>
                    <p class="text-label-secondary text-center">
                        Простір для реалізації найсміливіших технічних ідей та
                        творчих проектів
                    </p>
                </div>

                <div
                    class="bg-fill-tertiary p-8 rounded-xl border border-separator-secondary"
                >
                    <div
                        class="w-16 h-16 bg-accent-secondary rounded-full flex items-center justify-center mb-6 mx-auto"
                    >
                        <svg
                            class="w-8 h-8 text-background-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            ></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-4 text-center">
                        Навчання та Розвиток
                    </h3>
                    <p class="text-label-secondary text-center">
                        Майстер-класи, воркшопи та обмін знаннями між учасниками
                        спільноти
                    </p>
                </div>

                <div
                    class="bg-fill-secondary p-8 rounded-xl border border-separator-primary"
                >
                    <div
                        class="w-16 h-16 bg-accent-primary rounded-full flex items-center justify-center mb-6 mx-auto"
                    >
                        <svg
                            class="w-8 h-8 text-background-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            ></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-4 text-center">
                        Спільнота
                    </h3>
                    <p class="text-label-secondary text-center">
                        Зустрічі з однодумцями, нетворкінг та співпраця над
                        спільними проектами
                    </p>
                </div>
            </div>

            <div
                v-if="merchProducts.length > 0"
                class="mb-20"
            >
                <h2
                    class="text-3xl font-bold mb-8 text-center text-accent-primary"
                >
                    Мерч
                </h2>
                <div class="overflow-x-auto">
                    <div
                        class="flex gap-6 pb-4"
                        style="
                            scroll-snap-type: x mandatory;
                            scroll-behavior: smooth;
                        "
                    >
                        <article
                            v-for="product in merchProducts"
                            :key="product.slug"
                            class="flex flex-col flex-shrink-0 w-64 md:w-72"
                            style="scroll-snap-align: start"
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
                                <h3
                                    class="mt-3 font-bold text-label-primary group-hover:text-accent-primary transition-colors"
                                >
                                    {{ product.name }}
                                </h3>
                            </NuxtLink>

                            <p
                                class="mt-1 text-lg font-bold text-accent-primary"
                            >
                                Донат {{ formatPrice(product.priceUah) }}
                            </p>

                            <div class="mt-auto pt-3">
                                <MainButton
                                    button-style="primary"
                                    size="M"
                                    label="Отримати"
                                    class="w-full justify-center"
                                    :link="`/merch/${product.slug}`"
                                    @click="
                                        trackEvent('button_click', {
                                            button: 'landing_merch_get',
                                            slug: product.slug,
                                        })
                                    "
                                />
                            </div>
                        </article>
                    </div>
                </div>
                <div class="mt-6 text-center">
                    <MainButton
                        button-style="secondary"
                        size="M"
                        link="/merch"
                        class="justify-center"
                        @click="
                            trackEvent('button_click', {
                                button: 'landing_merch_all',
                            })
                        "
                    >
                        Дивитись весь мерч
                    </MainButton>
                </div>
            </div>

            <div class="mb-20">
                <h2
                    class="text-3xl font-bold mb-8 text-center text-accent-primary"
                >
                    Наші події
                </h2>
                <ClientOnly>
                    <gancio-events
                        baseurl="https://events.nu31.space"
                        show_recurrent="true"
                        maxlength="10"
                        sidebar="false"
                        :theme="theme"
                    />
                </ClientOnly>
            </div>

            <div
                class="text-center mb-20 bg-fill-secondary p-8 rounded-xl border border-separator-primary max-w-4xl mx-auto"
            >
                <h2 class="text-3xl font-bold mb-6 text-accent-primary">
                    Підтримайте нас
                </h2>
                <p class="text-xl text-label-secondary mb-8">
                    Ваша підтримка допомагає нам розвивати хакерспейс та
                    створювати нові можливості для спільноти
                </p>
                <div
                    class="flex flex-col md:flex-row justify-center items-center gap-8"
                >
                    <div
                        class="bg-white p-3 rounded-2xl shadow-sm border border-separator-primary"
                    >
                        <img
                            src="/img/monobank_qr.png"
                            alt="Monobank QR Code"
                            class="w-40 h-40 rounded-xl"
                        />
                    </div>
                    <div class="flex flex-col gap-4 w-full sm:w-auto">
                        <MainButton
                            button-style="primary"
                            size="L"
                            link="https://send.monobank.ua/jar/99aDNpRkWL"
                            icon="mdi:bank"
                            class="w-full justify-center"
                            @click="
                                trackEvent('button_click', {
                                    button: 'landing_support_monobank_top',
                                })
                            "
                        >
                            Підтримати на Monobank
                        </MainButton>
                        <MainButton
                            button-style="secondary"
                            size="L"
                            link="https://www.patreon.com/cw/NU31"
                            icon="mdi:patreon"
                            class="w-full justify-center"
                            @click="
                                trackEvent('button_click', {
                                    button: 'landing_support_patreon_top',
                                })
                            "
                        >
                            Підтримати на Patreon
                        </MainButton>
                    </div>
                </div>
            </div>

            <div class="text-center mb-20">
                <h2 class="text-3xl font-bold mb-6 text-accent-primary">
                    Приєднуйся до нас
                </h2>
                <p class="text-xl text-label-secondary mb-8">
                    Знаходимося в серці Києва, Україна
                </p>
                <MainButton
                    class="justify-center"
                    button-style="primary"
                    size="M"
                    link="https://discord.gg/X93qAG2jH6"
                    icon="ic:baseline-discord"
                    @click="
                        trackEvent('button_click', {
                            button: 'landing_join_discord',
                        })
                    "
                >
                    Ми тусимо в Discord, приєднуйся!
                </MainButton>
            </div>

            <div class="mb-20">
                <h2
                    class="text-3xl font-bold mb-8 text-center text-accent-primary"
                >
                    Медіа про нас
                </h2>
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <MediaPostCard
                        v-for="post in mediaPosts"
                        :key="post.sourceUrl"
                        :title="post.title"
                        :source-url="post.sourceUrl"
                        :image-url="post.imageUrl"
                    />
                </div>
            </div>

            <div class="mb-20">
                <h2
                    class="text-3xl font-bold mb-8 text-center text-accent-primary"
                >
                    Галерея
                </h2>
                <div class="overflow-x-auto">
                    <div
                        class="flex gap-4 pb-4"
                        style="
                            scroll-snap-type: x mandatory;
                            scroll-behavior: smooth;
                        "
                    >
                        <div
                            v-for="src in galleryImages"
                            :key="src"
                            class="flex-shrink-0"
                            style="scroll-snap-align: start"
                        >
                            <div
                                class="w-64 h-64 md:w-80 md:h-80 rounded-xl overflow-hidden bg-fill-tertiary border border-separator-primary"
                            >
                                <img
                                    :src="src"
                                    alt="Gallery image"
                                    class="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="text-center mb-20 bg-fill-secondary p-8 rounded-xl border border-separator-primary max-w-4xl mx-auto"
            >
                <h2 class="text-3xl font-bold mb-6 text-accent-primary">
                    Підтримайте нас
                </h2>
                <p class="text-xl text-label-secondary mb-8">
                    Ваша підтримка допомагає нам розвивати хакерспейс та
                    створювати нові можливості для спільноти
                </p>
                <div
                    class="flex flex-col md:flex-row justify-center items-center gap-8"
                >
                    <div
                        class="bg-white p-3 rounded-2xl shadow-sm border border-separator-primary"
                    >
                        <img
                            src="/img/monobank_qr.png"
                            alt="Monobank QR Code"
                            class="w-40 h-40 rounded-xl"
                        />
                    </div>
                    <div class="flex flex-col gap-4 w-full sm:w-auto">
                        <MainButton
                            button-style="primary"
                            size="L"
                            link="https://send.monobank.ua/jar/99aDNpRkWL"
                            icon="mdi:bank"
                            class="w-full justify-center"
                            @click="
                                trackEvent('button_click', {
                                    button: 'landing_support_monobank_bottom',
                                })
                            "
                        >
                            Підтримати на Monobank
                        </MainButton>
                        <MainButton
                            button-style="secondary"
                            size="L"
                            link="https://www.patreon.com/cw/NU31"
                            icon="mdi:patreon"
                            class="w-full justify-center"
                            @click="
                                trackEvent('button_click', {
                                    button: 'landing_support_patreon_bottom',
                                })
                            "
                        >
                            Підтримати на Patreon
                        </MainButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useHead } from '#imports'
import { onMounted } from 'vue'
import { trackEvent } from '~~/app/utils/track'
import { useTheme } from '~/composables/useTheme'

import { MERCH_PRODUCTS as merchProducts, formatPrice } from '~~/shared/merch'
import { MEDIA_POSTS as mediaPosts } from '~~/shared/media'

useHead({
    script: [
        {
            src: 'https://events.nu31.space/gancio-events.es.js',
        },
    ],
})

definePageMeta({
    layout: 'void',
})

const { theme } = useTheme()

// Static photos served from public/img/gallery, shown in this order.
const galleryImages = Array.from(
    { length: 27 },
    (_, i) => `/img/gallery/${String(i + 1).padStart(2, '0')}.jpg`
)

const legalAddress = `HACKERSPACE NU31
Nyzhnoiurkivska
Kyiv; Kyiv 04080`

onMounted(async () => {
    trackEvent('page_view', { page: 'landing' })
})
</script>
