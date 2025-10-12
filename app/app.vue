<template>
    <div class="bg-background-primary overflow-x-hidden max-w-full">
        <Header />
        <NuxtPage />
    </div>
</template>

<script setup lang="ts">
import { onMounted } from '#imports'
import { useUser } from '~/composables/useUser'

const { fetchUser } = useUser()

onMounted(async () => {
    await fetchUser()
})
</script>
