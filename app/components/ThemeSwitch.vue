<template>
    <MainButton
        icon="gg:dark-mode"
        size="M"
        @click="toggleTheme"
    />
</template>

<script setup>
import { useTheme } from '~/composables/useTheme'
const { toggleTheme } = useTheme()
</script>
