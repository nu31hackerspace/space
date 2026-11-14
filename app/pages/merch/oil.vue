<template>
    <div class="text-label-primary">
        <!-- Hero -->
        <section
            class="container mx-auto max-w-6xl px-4 pt-8 pb-16 md:pb-24 flex flex-col gap-10"
        >
            <NuxtLink
                to="/merch"
                class="text-sm text-label-secondary hover:text-accent-primary transition-colors"
            >
                ← Усі подарунки
            </NuxtLink>

            <div class="grid md:grid-cols-2 gap-10 items-center">
                <div class="flex flex-col gap-6">
                    <p
                        class="text-sm font-bold uppercase tracking-widest text-label-secondary"
                    >
                        Подарунок за донат · NU31
                    </p>
                    <h1
                        class="text-5xl md:text-7xl font-bold leading-none text-accent-primary"
                    >
                        Олива в кісточці
                    </h1>
                    <p class="text-xl md:text-2xl text-label-primary">
                        Змащуй 3D-принтер пензликом, а не з пляшки.
                    </p>

                    <div class="flex items-center gap-4">
                        <span
                            class="text-6xl font-bold leading-none text-accent-primary"
                        >
                            ×3
                        </span>
                        <span class="text-lg text-label-secondary">
                            Набір із трьох кісточок
                            <br />
                            за донат
                            <b class="text-label-primary">500 ₴</b>
                        </span>
                    </div>

                    <MainButton
                        button-style="primary"
                        size="L"
                        :link="OIL_JAR_URL"
                        icon="mdi:heart"
                        class="justify-center md:self-start"
                        @click="trackDonate('hero')"
                    >
                        Задонатити 500 ₴
                    </MainButton>
                </div>

                <img
                    src="/img/merch/oil-1.webp"
                    alt="Набір із трьох кісточок оливи NU31"
                    class="w-full aspect-[3/4] md:aspect-square object-cover rounded-3xl"
                />
            </div>
        </section>

        <!-- Problem -->
        <section class="bg-fill-secondary">
            <div
                class="container mx-auto max-w-4xl px-4 py-16 md:py-24 flex flex-col items-center gap-6 text-center"
            >
                <h2
                    class="text-4xl md:text-6xl font-bold leading-tight text-accent-primary"
                >
                    Принтеру потрібна олива. Столу — ні.
                </h2>
                <p class="text-lg md:text-xl text-label-secondary max-w-2xl">
                    З пляшки олива капає куди завгодно: на стіл, на деталь, на
                    підлогу. А надлишок на напрямних збирає пил. Пензлик
                    наносить тонкий рівний шар рівно туди, куди треба.
                </p>
            </div>
        </section>

        <!-- How to use -->
        <section
            class="container mx-auto max-w-6xl px-4 py-16 md:py-24 flex flex-col gap-10"
        >
            <h2
                class="text-4xl md:text-6xl font-bold text-center text-accent-primary"
            >
                Не лий. Мазни.
            </h2>

            <ol class="grid md:grid-cols-3 gap-6">
                <li class="flex flex-col gap-4">
                    <img
                        src="/img/merch/oil-2.webp"
                        alt="Крапля оливи на пензлику кісточки"
                        loading="lazy"
                        class="w-full aspect-[4/3] object-cover rounded-2xl"
                    />
                    <h3 class="text-2xl font-bold text-label-primary">
                        1. Прокрути
                    </h3>
                    <p class="text-label-secondary">
                        Олива надходить на пензлик. Без вичавлювання й
                        вгадування, скільки налити.
                    </p>
                </li>
                <li class="flex flex-col gap-4">
                    <img
                        src="/img/merch/oil-3.webp"
                        alt="Пензлик кісточки торкається напрямної 3D-принтера"
                        loading="lazy"
                        class="w-full aspect-[4/3] object-cover rounded-2xl"
                    />
                    <h3 class="text-2xl font-bold text-label-primary">
                        2. Проведи
                    </h3>
                    <p class="text-label-secondary">
                        Пензликом по напрямній, рейці чи ходовому гвинту.
                    </p>
                </li>
                <li class="flex flex-col gap-4">
                    <img
                        src="/img/merch/oil-4.webp"
                        alt="Тонкий шар оливи на напрямній після пензлика"
                        loading="lazy"
                        class="w-full aspect-[4/3] object-cover rounded-2xl"
                    />
                    <h3 class="text-2xl font-bold text-label-primary">
                        3. Готово
                    </h3>
                    <p class="text-label-secondary">
                        Кілька секунд — і можна друкувати далі.
                    </p>
                </li>
            </ol>
        </section>

        <!-- Features: photo and text, alternating sides -->
        <section class="bg-fill-secondary">
            <div
                class="container mx-auto max-w-6xl px-4 py-16 md:py-24 flex flex-col gap-16 md:gap-24"
            >
                <article
                    class="grid md:grid-cols-2 gap-8 md:gap-16 items-center"
                >
                    <img
                        src="/img/merch/oil-5.webp"
                        alt="Три кісточки оливи NU31 з етикетками"
                        loading="lazy"
                        class="w-full aspect-square object-cover rounded-3xl"
                    />
                    <div class="flex flex-col gap-4">
                        <p
                            class="text-sm font-bold uppercase tracking-widest text-label-secondary"
                        >
                            Олива
                        </p>
                        <h2
                            class="text-3xl md:text-5xl font-bold text-accent-primary"
                        >
                            Super Lube, ISO VG 68
                        </h2>
                        <p class="text-lg text-label-secondary">
                            Синтетична олива з в'язкістю ISO VG 68 для
                            напрямних, лінійних рейок, ходових гвинтів і
                            підшипників.
                        </p>
                    </div>
                </article>

                <article
                    class="grid md:grid-cols-2 gap-8 md:gap-16 items-center"
                >
                    <img
                        src="/img/merch/oil-6.webp"
                        alt="Три кісточки оливи поруч, видно розмір"
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
                            Влазить у шухляду, ящик з інструментом чи кишеню. І
                            дістає туди, куди з пляшкою не підлізеш.
                        </p>
                    </div>
                </article>

                <article
                    class="grid md:grid-cols-2 gap-8 md:gap-16 items-center"
                >
                    <img
                        src="/img/merch/oil-7.webp"
                        alt="Пензлики кісточок крупним планом"
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
                            Без крапель і перебору
                        </h2>
                        <p class="text-lg text-label-secondary">
                            Пензлик не дає оливі капати й розподіляє її тонким
                            рівним шаром по всій довжині напрямної.
                        </p>
                    </div>
                </article>
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
        <section class="bg-accent-primary text-background-primary">
            <div
                class="container mx-auto max-w-4xl px-4 py-16 md:py-24 flex flex-col items-center gap-6 text-center"
            >
                <h2 class="text-4xl md:text-6xl font-bold leading-tight">
                    Підтримай хакерспейс
                </h2>
                <p class="text-lg md:text-xl opacity-80 max-w-2xl">
                    Донатячи, ви підтримуєте роботу Київського Хакерспейсу NU31
                    та розвиток інженерії в Україні, а олива — наш подарунок вам
                    на подяку.
                </p>
                <a
                    :href="OIL_JAR_URL"
                    rel="noopener noreferrer"
                    class="mt-2 inline-flex items-center justify-center rounded-xl bg-background-primary px-8 py-4 text-lg font-bold text-accent-primary hover:opacity-90 transition-opacity"
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
import { DONATION_COMMENT_EXAMPLE } from '~~/shared/merch'
import { trackEvent } from '~~/app/utils/track'

// The oil has its own monobank jar, separate from MERCH_JAR_URL.
const OIL_JAR_URL = 'https://send.monobank.ua/jar/92rahpyhUb'

definePageMeta({ layout: 'default' })

// Link previews in chats (Telegram, Viber, Slack…); image and url must be
// absolute.
const baseUrl = useRuntimeConfig().public.baseUrl
const title = 'Олива в кісточці від НЮ31 — набір із трьох за донат 500 ₴'
const description =
    'Змащуй 3D-принтер пензликом, а не з пляшки. Подарунок за донат Київському Хакерспейсу NU31.'
useSeoMeta({
    title: `${title} | NU31`,
    description,
    ogType: 'website',
    ogSiteName: 'HACKER SPACE NU31',
    ogTitle: title,
    ogDescription: description,
    ogUrl: `${baseUrl}/merch/oil`,
    ogImage: `${baseUrl}/img/merch/oil-1.webp`,
    twitterCard: 'summary_large_image',
})

onMounted(() => {
    trackEvent('page_view', { page: 'merch_product', slug: 'oil' })
})

// `place` tells the hero button apart from the closing one in analytics.
function trackDonate(place: string) {
    trackEvent('button_click', { button: 'merch_donate', slug: 'oil', place })
}
</script>
