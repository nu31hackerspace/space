<!--
    The yellow sections reuse the background of the product photos, so they
    keep fixed colors (yellow + near-black) in both light and dark themes.
-->
<template>
    <div class="text-label-primary">
        <!-- Hero -->
        <section class="bg-[#e6cf45] text-[#111]">
            <div
                class="container mx-auto max-w-6xl px-4 pt-8 pb-16 md:pb-24 flex flex-col gap-10"
            >
                <NuxtLink
                    to="/merch"
                    class="text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                    ← Усі подарунки
                </NuxtLink>

                <div class="grid md:grid-cols-2 gap-10 items-center">
                    <div class="flex flex-col gap-6">
                        <p
                            class="text-sm font-bold uppercase tracking-widest opacity-70"
                        >
                            Подарунок за донат · NU31
                        </p>
                        <h1 class="text-5xl md:text-7xl font-bold leading-none">
                            Флюс у кісточці
                        </h1>
                        <p class="text-xl md:text-2xl">
                            Не потребує змивки. Зроблений мейкерами для
                            мейкерів.
                        </p>

                        <div class="flex items-center gap-4">
                            <span class="text-6xl font-bold leading-none">
                                ×3
                            </span>
                            <span class="text-lg">
                                Набір із трьох кісточок
                                <br />
                                за донат
                                <b>500 ₴</b>
                            </span>
                        </div>

                        <a
                            :href="MERCH_JAR_URL"
                            rel="noopener noreferrer"
                            class="inline-flex items-center justify-center md:self-start rounded-xl bg-[#111] px-8 py-4 text-lg font-bold text-[#e6cf45] hover:opacity-90 transition-opacity"
                            @click="trackDonate('hero')"
                        >
                            Задонатити 500 ₴
                        </a>
                    </div>

                    <img
                        src="/img/merch/flux-2.webp"
                        alt="Набір із трьох кісточок флюсу NU31"
                        class="w-full aspect-[3/4] md:aspect-square object-cover rounded-3xl"
                    />
                </div>
            </div>
        </section>

        <!-- Statement -->
        <section
            class="container mx-auto max-w-4xl px-4 py-16 md:py-24 flex flex-col items-center gap-6 text-center"
        >
            <h2
                class="text-4xl md:text-6xl font-bold leading-tight text-accent-primary"
            >
                Нанеси. Запаяй. Забудь.
            </h2>
            <p class="text-lg md:text-xl text-label-secondary max-w-2xl">
                Флюс неактивний, тож після пайки плату не треба відмивати. А
                пензлик кладе його точно на пади, а не на пів плати.
            </p>
        </section>

        <!-- How to use -->
        <section class="bg-fill-secondary">
            <div
                class="container mx-auto max-w-6xl px-4 py-16 md:py-24 flex flex-col gap-10"
            >
                <h2
                    class="text-4xl md:text-6xl font-bold text-center text-accent-primary"
                >
                    Три секунди на плату
                </h2>

                <ol class="grid md:grid-cols-3 gap-6">
                    <li class="flex flex-col gap-4">
                        <img
                            src="/img/merch/flux-5.webp"
                            alt="Крапля флюсу на пензлику кісточки"
                            loading="lazy"
                            class="w-full aspect-[4/3] object-cover rounded-2xl"
                        />
                        <h3 class="text-2xl font-bold text-label-primary">
                            1. Прокрути
                        </h3>
                        <p class="text-label-secondary">
                            Флюс надходить на пензлик — рівно стільки, скільки
                            треба.
                        </p>
                    </li>
                    <li class="flex flex-col gap-4">
                        <img
                            src="/img/merch/flux-4.webp"
                            alt="Нанесення флюсу кісточкою на пади друкованої плати"
                            loading="lazy"
                            class="w-full aspect-[4/3] object-cover rounded-2xl"
                        />
                        <h3 class="text-2xl font-bold text-label-primary">
                            2. Нанеси
                        </h3>
                        <p class="text-label-secondary">
                            Пензликом на пади, ніжки чи провід — точно туди, де
                            буде пайка.
                        </p>
                    </li>
                    <li class="flex flex-col gap-4">
                        <img
                            src="/img/merch/flux-6.webp"
                            alt="Плата із запаяним модулем ESP32 лежить на кісточці флюсу NU31"
                            loading="lazy"
                            class="w-full aspect-[4/3] object-cover rounded-2xl"
                        />
                        <h3 class="text-2xl font-bold text-label-primary">
                            3. Паяй
                        </h3>
                        <p class="text-label-secondary">
                            І не змивай: залишки флюсу можна лишити на платі.
                        </p>
                    </li>
                </ol>
            </div>
        </section>

        <!-- Features: photo and text, alternating sides -->
        <section
            class="container mx-auto max-w-6xl px-4 py-16 md:py-24 flex flex-col gap-16 md:gap-24"
        >
            <article class="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                <img
                    src="/img/merch/flux-3.webp"
                    alt="Пензлик кісточки флюсу крупним планом"
                    loading="lazy"
                    class="w-full aspect-square object-cover rounded-3xl"
                />
                <div class="flex flex-col gap-4">
                    <p
                        class="text-sm font-bold uppercase tracking-widest text-label-secondary"
                    >
                        Пензлик
                    </p>
                    <h2
                        class="text-3xl md:text-5xl font-bold text-accent-primary"
                    >
                        Точно, як олівцем
                    </h2>
                    <p class="text-lg text-label-secondary">
                        Жодних шприців і баночок: пензлик наносить тонкий шар
                        флюсу на дрібні SMD-пади без зайвого.
                    </p>
                </div>
            </article>

            <article class="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                <img
                    src="/img/merch/flux-1.webp"
                    alt="Кісточка флюсу NU31"
                    loading="lazy"
                    class="md:order-last w-full aspect-square object-cover rounded-3xl"
                />
                <div class="flex flex-col gap-4">
                    <p
                        class="text-sm font-bold uppercase tracking-widest text-label-secondary"
                    >
                        Кісточка
                    </p>
                    <h2
                        class="text-3xl md:text-5xl font-bold text-accent-primary"
                    >
                        Завжди під рукою
                    </h2>
                    <p class="text-lg text-label-secondary">
                        Влазить у кишеню, пенал чи ящик з інструментом. Одна —
                        на робочий стіл, друга — в сумку, третя — другу-мейкеру.
                    </p>
                </div>
            </article>
        </section>

        <!-- What to solder -->
        <section class="bg-fill-secondary">
            <div
                class="container mx-auto max-w-4xl px-4 py-16 md:py-24 flex flex-col items-center gap-8 text-center"
            >
                <h2 class="text-4xl md:text-6xl font-bold text-accent-primary">
                    Що паяти
                </h2>
                <ul
                    class="flex flex-wrap justify-center gap-3 text-lg font-bold text-label-primary"
                >
                    <li
                        class="rounded-full border-2 border-accent-primary px-5 py-2"
                    >
                        SMD-компоненти
                    </li>
                    <li
                        class="rounded-full border-2 border-accent-primary px-5 py-2"
                    >
                        DIP
                    </li>
                    <li
                        class="rounded-full border-2 border-accent-primary px-5 py-2"
                    >
                        Проводи
                    </li>
                </ul>
                <p class="text-lg text-label-secondary">
                    І все, що не алюміній чи чавун.
                </p>
            </div>
        </section>

        <!-- How to get -->
        <section
            class="container mx-auto max-w-6xl px-4 py-16 md:py-24 flex flex-col gap-10"
        >
            <h2
                class="text-4xl md:text-6xl font-bold text-center text-accent-primary"
            >
                Як отримати набір
            </h2>

            <ol class="grid md:grid-cols-3 gap-6">
                <li
                    class="flex flex-col gap-3 rounded-2xl border border-separator-primary bg-fill-secondary p-6"
                >
                    <span
                        class="text-5xl font-bold leading-none text-accent-primary"
                    >
                        1
                    </span>
                    <h3 class="text-xl font-bold text-label-primary">
                        Задонать
                    </h3>
                    <p class="text-label-secondary">
                        500 ₴ за один набір у банку monobank. Хочеш кілька
                        наборів — помнож суму: за 2 — 1000 ₴.
                    </p>
                </li>
                <li
                    class="flex flex-col gap-3 rounded-2xl border border-separator-primary bg-fill-secondary p-6"
                >
                    <span
                        class="text-5xl font-bold leading-none text-accent-primary"
                    >
                        2
                    </span>
                    <h3 class="text-xl font-bold text-label-primary">
                        Напиши, куди відправити
                    </h3>
                    <p class="text-label-secondary">
                        У коментарі до донату: прізвище та ім'я, телефон, місто
                        та відділення Нової Пошти.
                    </p>
                    <code
                        class="px-3 py-2 rounded bg-fill-tertiary text-label-primary text-sm break-all"
                    >
                        {{ DONATION_COMMENT_EXAMPLE }}
                    </code>
                </li>
                <li
                    class="flex flex-col gap-3 rounded-2xl border border-separator-primary bg-fill-secondary p-6"
                >
                    <span
                        class="text-5xl font-bold leading-none text-accent-primary"
                    >
                        3
                    </span>
                    <h3 class="text-xl font-bold text-label-primary">
                        Отримай набір
                    </h3>
                    <p class="text-label-secondary">
                        Ми відправимо три кісточки Новою Поштою на вказане
                        відділення.
                    </p>
                </li>
            </ol>
        </section>

        <!-- Final call -->
        <section class="bg-[#e6cf45] text-[#111]">
            <div
                class="container mx-auto max-w-4xl px-4 py-16 md:py-24 flex flex-col items-center gap-6 text-center"
            >
                <h2 class="text-4xl md:text-6xl font-bold leading-tight">
                    Підтримай хакерспейс
                </h2>
                <p class="text-lg md:text-xl opacity-80 max-w-2xl">
                    Донатячи, ви підтримуєте роботу Київського Хакерспейсу NU31
                    та розвиток інженерії в Україні, а флюс — наш подарунок вам
                    на подяку.
                </p>
                <a
                    :href="MERCH_JAR_URL"
                    rel="noopener noreferrer"
                    class="mt-2 inline-flex items-center justify-center rounded-xl bg-[#111] px-8 py-4 text-lg font-bold text-[#e6cf45] hover:opacity-90 transition-opacity"
                    @click="trackDonate('footer')"
                >
                    Задонатити 500 ₴ — отримати ×3
                </a>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useRuntimeConfig, useSeoMeta } from '#imports'
import { onMounted } from 'vue'
import { DONATION_COMMENT_EXAMPLE, MERCH_JAR_URL } from '~~/shared/merch'
import { trackEvent } from '~~/app/utils/track'

definePageMeta({ layout: 'default' })

// Link previews in chats (Telegram, Viber, Slack…); image and url must be
// absolute.
const baseUrl = useRuntimeConfig().public.baseUrl
const title = 'Флюс у кісточці від НЮ31 — набір із трьох за донат 500 ₴'
const description =
    'Флюс без змивки з пензликом, зроблений мейкерами для мейкерів. Подарунок за донат Київському Хакерспейсу NU31.'
useSeoMeta({
    title: `${title} | NU31`,
    description,
    ogType: 'website',
    ogSiteName: 'HACKER SPACE NU31',
    ogTitle: title,
    ogDescription: description,
    ogUrl: `${baseUrl}/merch/flux`,
    ogImage: `${baseUrl}/img/merch/flux-2.webp`,
    twitterCard: 'summary_large_image',
})

onMounted(() => {
    trackEvent('page_view', { page: 'merch_product', slug: 'flux' })
})

// `place` tells the hero button apart from the closing one in analytics.
function trackDonate(place: string) {
    trackEvent('button_click', { button: 'merch_donate', slug: 'flux', place })
}
</script>
