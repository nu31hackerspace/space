<template>
    <div>
        <h1>Wait few minutes for authorization</h1>
    </div>
</template>

<script setup lang="ts">
import { useFetch, useRoute, useRouter } from '#imports'

const code = useRoute().query.code as string

const router = useRouter()

const { data, error } = await useFetch('/api/auth/discord/auth', {
    method: 'POST',
    body: {
        code: code,
    },
})

if (data.value && !error.value) {
    router.push('/')
}

</script>
