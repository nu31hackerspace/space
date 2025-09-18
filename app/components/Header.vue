<template>
    <div class="container mx-auto px-4 py-4">
        <div class="flex justify-end space-x-4">
            <MainButton
                buttonStyle="primary"
                size="M"
                icon="ic:baseline-discord"
                label="Вхід для резедентів"
                :link="data?.redirectUri"
            />
            <ThemeSwitch />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useFetch } from '#imports'

const { data } = await useFetch<{ redirectUri: string }>(
    '/api/auth/discord/redirect'
)
</script>
