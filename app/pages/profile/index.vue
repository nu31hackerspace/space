<template>
    <div class="min-h-screen text-label-primary">
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-2xl mx-auto">
                <h1 class="text-3xl font-bold mb-8 text-accent-primary">
                    Профіль користувача
                </h1>

                <div
                    class="bg-fill-secondary p-8 rounded-xl border border-separator-primary"
                >
                    <div class="flex items-start gap-6">
                        <div class="flex-shrink-0">
                            <img
                                v-if="avatarUrl"
                                :src="avatarUrl"
                                :alt="user?.name || 'User avatar'"
                                class="w-32 h-32 rounded-full border-2 border-separator-primary"
                            />
                            <div
                                v-else
                                class="w-32 h-32 rounded-full bg-fill-tertiary border-2 border-separator-primary flex items-center justify-center"
                            >
                                <span class="text-4xl text-label-secondary">
                                    {{ user?.name?.charAt(0).toUpperCase() }}
                                </span>
                            </div>
                        </div>

                        <div class="flex-1 flex flex-col justify-center gap-4">
                            <div>
                                <h2
                                    class="text-2xl font-bold text-label-primary mb-1"
                                >
                                    {{ user?.name }}
                                </h2>
                                <p class="text-sm text-label-secondary">
                                    @{{ user?.username }}
                                </p>
                            </div>
                            <div>
                                <MainButton
                                    buttonStyle="secondary"
                                    size="M"
                                    icon="mdi:logout"
                                    @click="handleLogout"
                                >
                                    Вийти з акаунта
                                </MainButton>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    v-if="orders.length > 0"
                    class="bg-fill-secondary p-8 rounded-xl border border-separator-primary mt-6"
                >
                    <h2 class="text-xl font-bold text-label-primary mb-4">
                        Мої замовлення
                    </h2>
                    <ul class="flex flex-col gap-4">
                        <li
                            v-for="order in orders"
                            :key="order.id"
                            class="flex items-start justify-between gap-4 border-b border-separator-secondary pb-4 last:border-b-0 last:pb-0"
                        >
                            <div class="text-sm">
                                <div
                                    v-for="item in order.items"
                                    :key="item.productId"
                                    class="text-label-primary"
                                >
                                    {{ item.name }} × {{ item.quantity }}
                                </div>
                                <div class="text-label-secondary mt-1">
                                    {{
                                        new Date(
                                            order.createdAt
                                        ).toLocaleDateString()
                                    }}
                                    · {{ formatPrice(order.totalKopecks) }}
                                </div>
                                <div class="text-label-secondary">
                                    {{
                                        formatDelivery(order.customer.delivery)
                                    }}
                                </div>
                            </div>
                            <MainBadge
                                :variant="statusVariant(order.status)"
                                :label="statusLabel(order.status)"
                            />
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, navigateTo } from '#imports'
import { onMounted, ref } from 'vue'
import { useUser } from '~/composables/useUser'
import { trackEvent } from '~~/app/utils/track'
import type { MerchOrder, MerchOrderStatus } from '~~/shared/types/merch'
import { formatDelivery, formatPrice } from '~~/shared/merch'

definePageMeta({
    layout: 'default',
})

const { user, isLoggedIn, avatarUrl, fetchUser, logout } = useUser()

// Only orders placed while logged in appear here — a guest checkout has no
// user to attach to, and is tracked through its result-page link instead.
const orders = ref<MerchOrder[]>([])

function statusLabel(status: MerchOrderStatus): string {
    switch (status) {
        case 'paid':
            return 'Оплачено'
        case 'processing':
            return 'Обробка'
        case 'failed':
            return 'Не оплачено'
        case 'expired':
            return 'Протерміновано'
        case 'reversed':
            return 'Повернено'
        default:
            return 'Створено'
    }
}

function statusVariant(status: MerchOrderStatus): 'info' | 'success' | 'error' {
    if (status === 'paid') {
        return 'success'
    }
    if (['failed', 'expired', 'reversed'].includes(status)) {
        return 'error'
    }
    return 'info'
}

onMounted(async () => {
    trackEvent('page_view', { page: 'profile' })
    await fetchUser()

    if (!isLoggedIn.value) {
        navigateTo('/')
        return
    }

    try {
        orders.value =
            (await $fetch<MerchOrder[]>('/api/merch/orders/my', {
                credentials: 'include',
            })) || []
    } catch (error) {
        console.error('Failed to load merch orders:', error)
    }
})

const handleLogout = async () => {
    trackEvent('logout', { page: 'profile' })
    await logout()
}
</script>
