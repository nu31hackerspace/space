<template>
    <div
        class="min-h-screen bg-background-primary text-label-primary flex items-center justify-center"
    >
        <div class="container mx-auto px-4 py-16">
            <div class="max-w-4xl mx-auto text-center">
                <!-- Loading State -->
                <div
                    v-if="authState === 'loading'"
                    class="space-y-6"
                >
                    <div class="mb-8 flex justify-center">
                        <div
                            class="w-48 h-48 bg-accent-primary rounded-full flex items-center justify-center animate-pulse"
                        >
                            <Icon
                                icon="ic:baseline-discord"
                                class="w-32 h-32 text-background-primary"
                            />
                        </div>
                    </div>
                    <h1
                        class="text-4xl md:text-5xl font-bold mb-6 text-accent-primary"
                    >
                        Авторизація...
                    </h1>
                    <p class="text-xl text-label-secondary">
                        Будь ласка, зачекай кілька секунд
                    </p>
                </div>

                <!-- Stepper View for Incomplete Steps -->
                <div
                    v-else-if="authState === 'incomplete'"
                    class="space-y-8"
                >
                    <div class="mb-8 flex justify-center">
                        <div
                            class="w-32 h-32 bg-accent-primary rounded-full flex items-center justify-center"
                        >
                            <Icon
                                icon="ic:baseline-discord"
                                class="w-20 h-20 text-background-primary"
                            />
                        </div>
                    </div>

                    <h1
                        class="text-4xl md:text-5xl font-bold mb-6 text-accent-primary"
                    >
                        Процес авторизації
                    </h1>

                    <p class="text-lg text-label-secondary mb-8">
                        Для доступу до платформи потрібно виконати наступні
                        кроки:
                    </p>

                    <!-- Steps Container -->
                    <div class="max-w-2xl mx-auto space-y-6">
                        <!-- Step 1: Join Discord Server -->
                        <div
                            class="bg-fill-secondary rounded-xl p-6 border border-separator-primary text-left"
                        >
                            <div class="flex items-start gap-4">
                                <div class="flex-shrink-0 mt-1">
                                    <Icon
                                        icon="ic:baseline-check-circle"
                                        class="w-8 h-8"
                                        :class="[
                                            step1Complete
                                                ? 'text-success'
                                                : 'text-label-primary',
                                        ]"
                                    />
                                </div>
                                <div class="flex-grow">
                                    <h3
                                        class="text-xl font-semibold mb-2"
                                        :class="[
                                            step1Complete
                                                ? 'text-green-500'
                                                : 'text-label-primary',
                                        ]"
                                    >
                                        Крок 1: Приєднайся до Discord сервера
                                    </h3>
                                    <p class="text-label-secondary mb-4">
                                        Наш сервіс доступний лише для членів
                                        спільноти NU31 Hacker Space. Приєднайся
                                        до нашого Discord сервера.
                                    </p>
                                    <MainButton
                                        v-if="!step1Complete"
                                        class="w-full md:w-auto"
                                        buttonStyle="primary"
                                        size="M"
                                        link="https://discord.gg/kgTHaaHWyD"
                                        icon="ic:baseline-discord"
                                    >
                                        Приєднатися до Discord
                                    </MainButton>
                                    <div
                                        v-else
                                        class="text-green-500 font-semibold"
                                    >
                                        ✓ Виконано
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Get Member Role -->
                        <div
                            class="bg-fill-secondary p-6 rounded-xl border border-separator-primary text-left"
                        >
                            <div class="flex items-start gap-4">
                                <div class="flex-shrink-0 mt-1">
                                    <Icon
                                        icon="ic:baseline-check-circle"
                                        :class="[
                                            'w-8 h-8',
                                            step2Complete
                                                ? 'text-green-500'
                                                : 'text-red-500',
                                        ]"
                                    />
                                </div>
                                <div class="flex-grow">
                                    <h3
                                        class="text-xl font-semibold mb-2"
                                        :class="[
                                            step2Complete
                                                ? 'text-green-500'
                                                : 'text-label-primary',
                                        ]"
                                    >
                                        Крок 2: Отримай роль Резидент/ка
                                    </h3>
                                    <p class="text-label-secondary">
                                        Запитай на Discord сервері як її
                                        отримати. Зверніся до адміністраторів
                                        або прочитай інформацію в каналі з
                                        правилами.
                                    </p>
                                    <div
                                        v-if="step2Complete"
                                        class="text-green-500 font-semibold mt-4"
                                    >
                                        ✓ Виконано
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="space-y-4 pt-8">
                        <MainButton
                            class="justify-center w-full md:w-auto"
                            buttonStyle="primary"
                            size="L"
                            :link="redirectUriData?.redirectUri"
                        >
                            Спробувати авторизуватись знову
                        </MainButton>

                        <div class="pt-4">
                            <MainButton
                                class="justify-center w-full md:w-auto"
                                buttonStyle="secondary"
                                size="M"
                                link="/"
                            >
                                Повернутися на головну
                            </MainButton>
                        </div>
                    </div>
                </div>

                <!-- Generic Error -->
                <div
                    v-else-if="authState === 'error'"
                    class="space-y-6"
                >
                    <div class="mb-8 flex justify-center">
                        <div
                            class="w-48 h-48 bg-red-500 rounded-full flex items-center justify-center"
                        >
                            <Icon
                                icon="ic:baseline-error"
                                class="w-32 h-32 text-background-primary"
                            />
                        </div>
                    </div>

                    <h1
                        class="text-4xl md:text-5xl font-bold mb-6 text-red-500"
                    >
                        Помилка авторизації
                    </h1>

                    <div class="space-y-4 mb-10">
                        <p class="text-xl text-label-secondary">
                            Виникла непередбачувана помилка під час авторизації.
                        </p>
                        <p
                            class="text-lg text-label-secondary"
                            v-if="errorMessage"
                        >
                            {{ errorMessage }}
                        </p>
                    </div>

                    <div class="flex flex-col gap-4">
                        <MainButton
                            class="w-full md:w-auto"
                            buttonStyle="primary"
                            size="L"
                            :link="redirectUriData?.redirectUri"
                        >
                            Спробувати знову
                        </MainButton>
                        <MainButton
                            class="w-full md:w-auto"
                            buttonStyle="secondary"
                            size="M"
                            link="/"
                        >
                            Повернутися на головну
                        </MainButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    definePageMeta,
    onMounted,
    ref,
    useFetch,
    useRoute,
    useRouter,
} from '#imports'
import { Icon } from '@iconify/vue'
import { trackEvent } from '~/utils/track'
import type { AuthResponse } from '~~/shared/types/auth_response'

definePageMeta({
    layout: 'doc',
})

type AuthState = 'loading' | 'incomplete' | 'error'

const code = useRoute().query.code as string
const router = useRouter()
const authState = ref<AuthState>('loading')
const errorMessage = ref<string>('')
const step1Complete = ref<boolean>(false)
const step2Complete = ref<boolean>(false)

const { data: redirectUriData } = await useFetch<{ redirectUri: string }>(
    '/api/auth/discord/redirect'
)

onMounted(async () => {
    trackEvent('page_view', { page: 'discord_callback' })

    try {
        const response = await $fetch<AuthResponse>('/api/auth/discord/auth', {
            method: 'POST',
            body: {
                code: code,
            },
        })

        if (response.success) {
            trackEvent('auth_success', { provider: 'discord' })
            await router.push('/home')
        } else {
            step1Complete.value = response.stepStatus.step1Complete
            step2Complete.value = response.stepStatus.step2Complete

            authState.value = 'incomplete'

            if (!step1Complete.value) {
                trackEvent('auth_failed', {
                    reason: 'not_in_guild',
                })
            } else if (!step2Complete.value) {
                trackEvent('auth_failed', {
                    reason: 'no_member_role',
                })
            } else {
                trackEvent('auth_failed', {
                    reason: 'unknown',
                })
            }
        }
    } catch (error: any) {
        console.error('Authorization failed:', error)
        authState.value = 'error'
        errorMessage.value =
            error?.statusMessage || error?.message || 'Невідома помилка'
        trackEvent('auth_failed', {
            provider: 'discord',
            reason: 'error',
            error: errorMessage.value,
        })
    }
})
</script>
