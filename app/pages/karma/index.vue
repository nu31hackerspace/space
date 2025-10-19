<template>
    <div class="min-h-screen text-label-primary">
        <div class="container mx-auto px-4 py-8">
            <div class="max-w-6xl mx-auto">
                <div class="mb-8">
                    <h1 class="text-4xl font-bold text-accent-primary mb-2">
                        Karma Leaderboard
                    </h1>
                </div>

                <div
                    v-if="pending"
                    class="flex items-center justify-center py-20"
                >
                    <div class="text-center">
                        <div
                            class="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-primary mx-auto mb-4"
                        ></div>
                        <p class="text-label-secondary">Loading members...</p>
                    </div>
                </div>

                <div
                    v-else-if="data"
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    <div
                        v-for="member in data.members"
                        :key="member.discord_id"
                        class="bg-fill-secondary p-4 rounded-xl border border-separator-primary"
                    >
                        <div class="flex items-center gap-4">
                            <div class="flex-shrink-0">
                                <img
                                    v-if="member.avatar_url"
                                    :src="member.avatar_url"
                                    :alt="member.username"
                                    class="w-16 h-16 rounded-full border-2 border-separator-primary object-cover"
                                    @error="handleImageError"
                                />
                                <div
                                    v-else
                                    class="w-16 h-16 rounded-full bg-fill-tertiary border-2 border-separator-primary flex items-center justify-center"
                                >
                                    <span
                                        class="text-2xl font-bold text-label-secondary"
                                    >
                                        {{ getInitials(member.username) }}
                                    </span>
                                </div>
                            </div>

                            <div class="flex-1 min-w-0">
                                <h3
                                    class="text-lg font-bold text-label-primary truncate"
                                >
                                    {{ member.username }}
                                </h3>
                                <div class="flex items-center gap-2 mt-1">
                                    <span
                                        class="text-2xl font-bold text-accent-primary"
                                    >
                                        {{ member.karma }}
                                    </span>
                                    <span class="text-sm text-label-secondary">
                                        karma
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    v-else
                    class="bg-fill-secondary p-8 rounded-xl border border-separator-primary text-center"
                >
                    <p class="text-label-secondary text-lg">No members found</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useFetch } from '#imports'
import { onMounted } from 'vue'
import { trackEvent } from '~~/app/utils/track'

definePageMeta({
    layout: 'default',
    middleware: 'auth',
})

type Member = {
    discord_id: string
    username: string
    avatar_id: string | null
    karma: number
    avatar_url: string | null
}

type KarmaResponse = {
    members: Member[]
}

const { data, pending, error } = await useFetch<KarmaResponse>('/api/karma/all')

onMounted(() => {
    trackEvent('page_view', { page: 'karma' })
})

function getInitials(username: string): string {
    if (!username) return '?'
    const parts = username
        .trim()
        .split(/\s+/)
        .filter((p) => p.length > 0)
    if (parts.length >= 2) {
        const first = parts[0]?.[0] ?? ''
        const second = parts[1]?.[0] ?? ''
        return (first + second).toUpperCase()
    }
    return username.substring(0, 2).toUpperCase()
}

function handleImageError(event: Event) {
    if (event.target) {
        const img = event.target as HTMLImageElement
        img.style.display = 'none'
    }
}
</script>
