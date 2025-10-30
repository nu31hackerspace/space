<template>
    <div
        class="min-h-screen text-label-primary container flex flex-col items-center justify-start mx-auto px-4 py-8 max-w-6xl">
        <h1 class="text-4xl font-bold text-accent-primary mb-8">Electricity</h1>

        <div v-if="data?.trackers" class="space-y-4 w-full">
            <NuxtLink v-for="tracker in data.trackers" :key="tracker.slug" :to="`/electricity/${tracker.slug}`"
                class="block bg-fill-secondary p-4 rounded-xl border border-separator-primary hover:border-accent-primary transition-colors">
                <h3 class="text-lg font-semibold text-label-primary mb-2">
                    {{ tracker.name }}
                </h3>
                <p class="text-sm text-label-secondary">
                    Останній раз активний:
                    {{ formatDate(tracker.lastAlive) }}
                </p>
            </NuxtLink>
        </div>

        <div class="my-8 bg-fill-secondary p-4 rounded-xl border border-separator-primary w-full">
            <div class="flex gap-4">
                <input v-model="newTrackerName" type="text" placeholder="Enter tracker name"
                    class="flex-1 px-4 py-2 bg-fill-primary border border-separator-primary rounded-lg text-label-primary focus:outline-none focus:border-accent-primary"
                    @keyup.enter="addTracker" />
                <MainButton @click="addTracker" :label="isAdding ? 'Adding...' : 'Add'" button-style="primary" />
            </div>
        </div>

        <div v-if="showTokenDialog" class="flex flex-col items-center justify-center w-full">
            <div class="bg-fill-secondary rounded-xl border border-separator-primary p-6 max-w-2xl w-full mx-4 backdrop-blur-sm"
                @click.stop>
                <h3 class="text-xl font-bold text-label-primary mb-4">
                    Tracker Token
                </h3>
                <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                    <p class="text-red-500 text-sm font-semibold">
                        ⚠️ Це остання можливість скопіювати токен, зробіть це
                        перед тим як виконати будь яку іншу дію
                    </p>
                </div>
                <div class="flex gap-2 mb-4">
                    <input :value="newTrackerToken" readonly
                        class="flex-1 px-4 py-2 bg-fill-primary border border-separator-primary rounded-lg text-label-primary text-sm font-mono" />
                    <MainButton @click="copyToken" label="Copy" button-style="primary" icon="mdi:content-copy" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useFetch, ref } from '#imports'
import type { ElectricityTracker } from '~~/shared/types/electricity_device'
import MainButton from '~/components/MainButton.vue'

definePageMeta({
    layout: 'default',
})

const { data, refresh } = await useFetch<{
    trackers: ElectricityTracker[]
}>('/api/electricty_tracker/all')

const newTrackerName = ref('')
const isAdding = ref(false)
const showTokenDialog = ref(false)
const newTrackerToken = ref('')

const addTracker = async () => {
    if (!newTrackerName.value.trim() || isAdding.value) return

    isAdding.value = true
    try {
        const response = await $fetch<{
            tracker: {
                name: string
                slug: string
                trackerJwtToken: string
            }
        }>('/api/electricty_tracker', {
            method: 'POST',
            body: {
                name: newTrackerName.value,
            },
        })

        newTrackerToken.value = response.tracker.trackerJwtToken
        showTokenDialog.value = true
        newTrackerName.value = ''
        await refresh()
    } catch (error) {
        console.error('Error adding tracker:', error)
    } finally {
        isAdding.value = false
    }
}

const copyToken = async () => {
    await navigator.clipboard.writeText(newTrackerToken.value)
}

const formatDate = (date: Date | undefined) => {
    if (!date) return 'Невідомо'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
}
</script>
