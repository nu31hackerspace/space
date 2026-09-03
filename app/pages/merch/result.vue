<template>
    <div class="min-h-screen text-label-primary">
        <div class="container mx-auto px-4 py-16">
            <div
                class="max-w-lg mx-auto bg-fill-secondary border border-separator-primary rounded-xl p-8 text-center flex flex-col items-center gap-4"
            >
                <MainBadge
                    :variant="badgeVariant"
                    :label="badgeLabel"
                />

                <h1 class="text-2xl font-bold text-accent-primary">
                    {{ title }}
                </h1>

                <p class="text-label-secondary">
                    {{ message }}
                </p>

                <p
                    v-if="reference"
                    class="text-xs text-label-tertiary break-all"
                >
                    Номер замовлення: {{ reference }}
                </p>

                <div class="flex gap-3 mt-2">
                    <MainButton
                        button-style="secondary"
                        size="M"
                        label="До мерчу"
                        link="/merch"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useRoute } from '#imports'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type {
    MerchOrderStatus,
    MerchOrderStatusResponse,
} from '~~/shared/types/merch'
import { formatPrice } from '~~/shared/merch'

definePageMeta({ layout: 'default' })

// monobank redirects here right after the payment page closes, which is often
// a moment before the webhook lands — so the page polls until the order
// settles instead of reporting whatever it saw first.
const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 40

const route = useRoute()
const reference = computed(() => String(route.query.ref || ''))

const status = ref<MerchOrderStatus | 'unknown'>('unknown')
const totalKopecks = ref(0)
const polls = ref(0)
let timer: ReturnType<typeof setTimeout> | null = null

const isSettled = computed(() =>
    ['paid', 'failed', 'expired', 'reversed'].includes(status.value)
)

const badgeVariant = computed(() => {
    if (status.value === 'paid') {
        return 'success'
    }
    if (['failed', 'expired', 'reversed'].includes(status.value)) {
        return 'error'
    }
    return 'info'
})

const badgeLabel = computed(() => {
    switch (status.value) {
        case 'paid':
            return 'Оплачено'
        case 'failed':
            return 'Не оплачено'
        case 'expired':
            return 'Час вичерпано'
        case 'reversed':
            return 'Повернено'
        default:
            return 'Обробка'
    }
})

const title = computed(() => {
    switch (status.value) {
        case 'paid':
            return 'Дякуємо за замовлення!'
        case 'failed':
            return 'Оплата не пройшла'
        case 'expired':
            return 'Рахунок протермінувався'
        case 'reversed':
            return 'Кошти повернено'
        default:
            return 'Перевіряємо оплату'
    }
})

const message = computed(() => {
    switch (status.value) {
        case 'paid':
            return `Ми отримали ${formatPrice(totalKopecks.value)} і зв'яжемось з тобою щодо доставки.`
        case 'failed':
            return 'Спробуй ще раз або скористайся іншою карткою.'
        case 'expired':
            return 'Рахунок дійсний одну годину. Оформи замовлення ще раз.'
        case 'reversed':
            return 'Оплату скасовано, кошти повернулись на картку.'
        default:
            return polls.value >= MAX_POLLS
                ? 'Оплата ще обробляється. Онови сторінку трохи згодом.'
                : 'Це займає кілька секунд…'
    }
})

async function poll() {
    if (!reference.value) {
        return
    }

    try {
        const response = await $fetch<MerchOrderStatusResponse>(
            `/api/merch/orders/status/${encodeURIComponent(reference.value)}`
        )
        status.value = response.status
        totalKopecks.value = response.totalKopecks
    } catch {
        // Keep polling — a transient failure should not freeze the page on
        // 'unknown' when the next attempt may well succeed.
    }

    polls.value += 1

    if (!isSettled.value && polls.value < MAX_POLLS) {
        timer = setTimeout(poll, POLL_INTERVAL_MS)
    }
}

onMounted(poll)

onBeforeUnmount(() => {
    if (timer) {
        clearTimeout(timer)
    }
})
</script>
