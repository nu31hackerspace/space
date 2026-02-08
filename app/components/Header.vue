<template>
    <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <NuxtLink to="/home" class="text-3xl font-bold text-accent-primary hover:opacity-80 transition-opacity">
                    NU31
                </NuxtLink>
                <MainBadge v-if="!isLoading && status" :variant="badgeVariant" :label="badgeLabel" />
            </div>
            <nav class="flex items-center space-x-6">
                <NuxtLink to="/blog" class="text-label-primary hover:text-accent-primary transition-colors font-medium">
                    Блог
                </NuxtLink>
            </nav>
            <div class="flex items-center space-x-4">
                <NuxtLink v-if="isLoggedIn && avatarUrl" to="/profile"
                    class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <img :src="avatarUrl" :alt="user?.name || 'User avatar'"
                        class="w-10 h-10 rounded-full border-1 border-separator-primary" />
                    <span class="text-sm font-medium text-label-primary">
                        {{ user?.name }}
                    </span>
                </NuxtLink>
                <ThemeSwitch />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUser } from '~/composables/useUser'
import { useElectricityStatus } from '~/composables/useElectricityStatus'

const { user, isLoggedIn, avatarUrl } = useUser()
const { status, isLoading, badgeVariant, badgeLabel, fetchStatus } = useElectricityStatus()

onMounted(() => {
    useUser().fetchUser()
    fetchStatus()
})
</script>
