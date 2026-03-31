<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-accent-primary flex items-center gap-2">
                <Icon icon="mdi:access-point-network" /> MQTT Live Topics
            </h1>
            <MainButton @click="refreshSelected" buttonStyle="ghost" size="S" icon="mdi:refresh" :disabled="pending">
                Refresh
            </MainButton>
        </div>

        <div class="grid grid-cols-1 gap-8">
            <div class="bg-fill-secondary border border-separator-primary rounded-xl p-6">
                <div v-if="pending && topics.length === 0" class="text-center text-label-secondary py-8">
                    <Icon icon="mdi:loading" class="animate-spin text-3xl mx-auto mb-2" />
                    <p>Loading active topics...</p>
                </div>

                <div v-else-if="topics.length === 0" class="text-center text-label-secondary py-8">
                    <Icon icon="mdi:sleep" class="text-3xl mx-auto mb-2 text-separator-primary" />
                    <p>No active topics detected yet.</p>
                </div>

                <div v-else class="space-y-4">
                    <div v-for="item in topics" :key="item.topic" class="bg-background-primary p-4 rounded-lg flex flex-col sm:flex-row gap-4 justify-between border border-separator-primary">
                        <div class="flex-1 min-w-0">
                            <h3 class="font-mono text-sm font-semibold text-accent-primary break-all mb-1">{{ item.topic }}</h3>
                            <div class="text-xs text-label-secondary flex items-center gap-4">
                                <span><Icon icon="mdi:email-outline" class="inline mr-1" />{{ item.messageCount }} msgs</span>
                                <span><Icon icon="mdi:clock-outline" class="inline mr-1" />{{ formatTime(item.lastMessageAt) }}</span>
                            </div>
                        </div>
                        <div class="sm:w-1/2 mt-2 sm:mt-0 bg-fill-tertiary p-2 rounded text-xs font-mono text-label-secondary break-all">
                            {{ item.lastPayloadPreview || '(Empty Payload)' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useFetch } from '#imports'
import { ref, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const { data, pending, refresh } = await useFetch('/api/admin/mqtt/topics')

const topics = ref<Array<{
    topic: string
    messageCount: number
    lastMessageAt: string
    lastPayloadPreview: string
}>>([])

if (data.value?.topics) {
    topics.value = data.value.topics as any
}

let interval: ReturnType<typeof setInterval>

async function refreshSelected() {
    await refresh()
    if (data.value && data.value.topics) {
        topics.value = data.value.topics as any
    }
}

onMounted(() => {
    // Poll for new topics every 2 seconds
    interval = setInterval(async () => {
        await refreshSelected()
    }, 2000)
})

onUnmounted(() => {
    if (interval) clearInterval(interval)
})

function formatTime(dateStr: string) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleTimeString()
}
</script>
