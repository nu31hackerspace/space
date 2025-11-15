<template>
    <span :class="[
        'inline-flex items-center justify-center rounded-lg',
        'px-3 py-1 text-sm font-semibold',
        variantClasses[variant],
    ]" :style="variantStyles[variant]">
        {{ label }}
        <slot />
    </span>
</template>

<script setup lang="ts">
interface Props {
    label?: string
    variant?: 'info' | 'success' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
    label: '',
    variant: 'info',
})

const variantClasses = {
    info: 'bg-accent-primary text-background-primary',
    success: '',
    error: '',
}

const variantStyles = {
    info: {},
    success: { backgroundColor: '#16a34a', color: '#ffffff' }, // green-600
    error: { backgroundColor: '#dc2626', color: '#ffffff' }, // red-600
}
</script>
