<template>
    <MainBadge
        :label="label"
        :variant="variants[status]"
        :title="lastSeenTitle"
    />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { LastElectricityResponse } from '~~/shared/types/electricity'

type ElectricityStatus = 'on' | 'off' | 'unknown'

// The sensor pings the backend while there is power, so a ping older
// than this means the power is out.
const OFFLINE_AFTER_MS = 3 * 60 * 1000
const REFRESH_INTERVAL_MS = 60 * 1000

const labels: Record<ElectricityStatus, string> = {
    on: '💡 Світло є',
    off: '🕯️ Світла немає',
    unknown: '❔ Стан світла невідомий',
}

const variants: Record<ElectricityStatus, 'success' | 'error' | 'info'> = {
    on: 'success',
    off: 'error',
    unknown: 'info',
}

const status = ref<ElectricityStatus>('unknown')
const lastSeenAt = ref<Date | null>(null)

const label = computed(() => {
    if (status.value === 'off' && lastSeenAt.value) {
        return `${labels.off} з ${formatSince(lastSeenAt.value)}`
    }
    return labels[status.value]
})

const lastSeenTitle = computed(() =>
    lastSeenAt.value
        ? `Останній сигнал: ${lastSeenAt.value.toLocaleString('uk-UA')}`
        : undefined
)

// Show only the time for today, and add the date for older outages.
function formatSince(date: Date): string {
    const time = date.toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
    })
    if (date.toDateString() === new Date().toDateString()) {
        return time
    }
    const day = date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
    })
    return `${day} ${time}`
}

async function refresh() {
    try {
        const response = await $fetch<LastElectricityResponse>(
            '/api/nu31electricity/last'
        )
        lastSeenAt.value = response.lastSeenAt
            ? new Date(response.lastSeenAt)
            : null
        const isFresh =
            lastSeenAt.value !== null &&
            Date.now() - lastSeenAt.value.getTime() < OFFLINE_AFTER_MS
        status.value = isFresh ? 'on' : 'off'
    } catch (error) {
        console.warn('Failed to load electricity status:', error)
        lastSeenAt.value = null
        status.value = 'unknown'
    }
}

let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
    refresh()
    timer = setInterval(refresh, REFRESH_INTERVAL_MS)
})

onUnmounted(() => {
    clearInterval(timer)
})
</script>
