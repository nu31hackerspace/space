<template>
    <div class="min-h-screen text-label-primary">
        <div class="relative w-full">
            <div class="w-full h-full"></div>
            <div class="w-full aspect-[1920/1080] relative">
                <div
                    class="w-full h-full absolute inset-0 z-20 flex items-center text-center justify-center"
                >
                    <span class="text-8xl font-wallpoet text-accent-primary">
                        NU31 Hacker Space
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
                <p class="text-xl text-label-secondary">
                    NU31 — це простір для творчих людей, інноваторів та
                    ентузіастів технологій. Ми створюємо середовище, де можна
                    експериментувати, навчатися та реалізовувати найсміливіші
                    ідеї.
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

            <div class="text-center mb-20">
                <h2 class="text-3xl font-bold mb-6 text-accent-primary">
                    Приєднуйся до нас
                </h2>
                <p class="text-xl text-label-secondary mb-8">
                    Знаходимося в серці Києва, Україна
                </p>
                <MainButton
                    class="justify-center"
                    buttonStyle="primary"
                    size="M"
                    link="https://discord.gg/kgTHaaHWyD"
                    icon="ic:baseline-discord"
                >
                    Ми тусимо в Discord, приєднуйся!
                </MainButton>
            </div>

            <div class="border-t border-separator-primary pt-16">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 class="text-2xl font-bold mb-4 text-accent-primary">
                            Контакти
                        </h3>
                        <p class="text-label-secondary mb-2">
                            📍 Київ, Україна
                        </p>
                        <p class="text-label-secondary mb-2">
                            📧 Нижньоюрківська 31
                        </p>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold mb-4 text-accent-primary">
                            Соціальні мережі
                        </h3>
                        <div class="flex">
                            <MainButton
                                buttonStyle="ghost"
                                size="L"
                                link="https://github.com/nu31hackerspace"
                                icon="mdi:github"
                            ></MainButton>
                            <MainButton
                                buttonStyle="ghost"
                                size="L"
                                link="https://www.instagram.com/nu31hackerspace/"
                                icon="mdi:instagram"
                            ></MainButton>
                            <MainButton
                                buttonStyle="ghost"
                                size="L"
                                link="https://discord.gg/kgTHaaHWyD"
                                icon="ic:baseline-discord"
                            ></MainButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { trackEvent } from '~~/app/utils/track'

onMounted(() => {
    trackEvent('page_view', { page: 'landing' })
})
</script>
