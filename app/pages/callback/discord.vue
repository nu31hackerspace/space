<template>
    <div>
        <h1>Wait few minutes for authorization</h1>
    </div>
</template>

<script setup lang="ts">
import { onMounted, useRoute, useRouter } from '#imports'

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

        await router.push('/')
    } catch (error) {
        console.error('Authorization failed:', error)
    }
})
</script>
