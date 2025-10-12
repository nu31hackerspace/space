<template>
    <div class="container mx-auto px-4 py-4">
        <div class="flex justify-end space-x-4 items-center">
            <div
                v-if="isLoggedIn && avatarUrl"
                class="flex items-center space-x-3"
            >
                <img
                    :src="avatarUrl"
                    :alt="user?.name || 'User avatar'"
                    class="w-10 h-10 rounded-full border-1 border-separator-primary"
                />
                <span class="text-sm font-medium text-label-primary">
                    {{ user?.name }}
                </span>
            </div>
            <ThemeSwitch />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUser } from '~/composables/useUser'

const { user, isLoggedIn, avatarUrl } = useUser()

onMounted(() => {
    useUser().fetchUser()
})
</script>
