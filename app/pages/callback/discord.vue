<template>
    <div>
        <h1>Wait few minutes for authorization</h1>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, onMounted, useRoute, useRouter } from '#imports'

definePageMeta({
    layout: 'void',
})

const code = useRoute().query.code as string
const router = useRouter()

onMounted(async () => {
    try {
        await $fetch('/api/auth/discord/auth', {
            method: 'POST',
            body: {
                code: code,
            },
        })

        await router.push('/home')
    } catch (error) {
        console.error('Authorization failed:', error)
    }
})
</script>
