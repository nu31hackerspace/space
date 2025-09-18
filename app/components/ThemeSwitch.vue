<template>
    <MainButton
        @click="toggleTheme"
        icon="gg:dark-mode"
        size="M"
    />
</template>

<script setup>
import { useTheme } from '~/composables/useTheme'
const { toggleTheme } = useTheme()
const lightThemeIcon = 'material-symbols:light-mode'
</script>
