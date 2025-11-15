<template>
    <div
        class="min-h-screen text-label-primary container flex flex-col items-center justify-start mx-auto px-4 py-8 max-w-5xl">
        <div class="w-full mb-6">
            <NuxtLink to="/electricity" class="text-accent-primary hover:underline text-sm">← Back to trackers
            </NuxtLink>
        </div>

        <h1 class="text-3xl font-bold text-accent-primary mb-6">
            {{ data?.tracker.name }}
        </h1>

        <div class="w-full grid gap-4 md:grid-cols-3">
            <div class="bg-fill-secondary p-4 rounded-xl border border-separator-primary md:col-span-2">
                <div class="flex items-center gap-3 mb-2">
                    <MainBadge
                        :variant="currentStatus === 'online' ? 'success' : 'error'"
                        :label="currentStatus === 'online' ? 'світло є' : 'світла немає'"
                    />
                </div>
                <p class="text-sm text-label-secondary">
                    Last seen: {{ formatDate(data?.current.lastAliveAt) }}
                </p>
                <p class="text-sm text-label-secondary">
                    Since: {{ formatDate(data?.current.since) }}
                </p>
            </div>

            <div class="bg-fill-secondary p-4 rounded-xl border border-separator-primary">
                <p class="text-sm text-label-secondary">Slug</p>
                <p class="font-mono text-sm">{{ data?.tracker.slug }}</p>
                <p class="text-sm text-label-secondary mt-3">Created</p>
                <p class="text-sm">{{ formatDate(data?.tracker.createdAt) }}</p>
            </div>
        </div>

        <div class="w-full mt-8 bg-fill-secondary p-4 rounded-xl border border-separator-primary">
            <h2 class="text-xl font-semibold mb-4">Status changes (last week)</h2>

            <div v-if="data?.history?.length" class="space-y-3">
                <div v-for="(h, idx) in data.history" :key="idx"
                    class="flex items-center justify-between p-3 rounded-lg border border-separator-primary bg-fill-primary">
                    <div class="flex items-center gap-2">
                        <span :class="[
                            'inline-block w-2 h-2 rounded-full',
                            h.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                        ]" />
                        <span class="capitalize">{{ h.status }}</span>
                    </div>
                    <div class="text-sm text-label-secondary">
                        <span>{{ formatDate(h.start) }}</span>
                        <span> → </span>
                        <span>{{ h.end ? formatDate(h.end) : 'now' }}</span>
                    </div>
                </div>
            </div>

            <div v-else class="text-sm text-label-secondary">No activity in the last week.</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useFetch, useRoute, computed } from '#imports'

definePageMeta({
    layout: 'default',
})

type Status = 'online' | 'offline'

type ApiResponse = {
    tracker: { name: string; slug: string; createdAt: string }
    current: { status: Status; lastAliveAt?: string; since?: string }
    history: { status: Status; start: string; end: string | null }[]
}

const route = useRoute()
const slug = route.params.slug as string

const { data } = await useFetch<ApiResponse>(`/api/electricty_tracker/${slug}/history`)

const currentStatus = computed<Status>(() => (data.value?.current.status ?? 'offline'))

const formatDate = (date?: string) => {
    if (!date) return '—'
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })
}
</script>
