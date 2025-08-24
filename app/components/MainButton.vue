<template>
    <component :is="link ? 'a' : 'button'" :class="[
        'inline-flex items-center justify-center font-semibold rounded-lg',
        variantClasses[buttonStyle],
        sizeClasses[size],
    ]" :href="link" :target="link ? '_blank' : undefined" :rel="link ? 'noopener noreferrer' : undefined"
        @click="link ? undefined : $emit('click', $event)">
        <slot />
    </component>
</template>

<script setup lang="ts">
interface Props {
    size?: 'S' | 'M'
    buttonStyle?: 'primary' | 'secondary' | 'ghost',
    state?: 'default' | 'disabled',
    link?: string
}

interface Emits {
    (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
    size: 'M',
    buttonStyle: 'primary',
    state: 'default',
    link: '',
})

defineEmits<Emits>()

const sizeClasses = {
    S: 'px-4 py-2 text-xs font-bold',
    M: 'px-6 py-3 text-sm font-bold'
}

const variantClasses = {
    'primary': 'bg-accent-primary hover:bg-accent-secondary text-background-primary',
    'secondary': 'bg-fill-tertiary hover:bg-fill-secondary text-label-primary',
    'ghost': 'bg-transparent hover:bg-fill-tertiary text-label-primary'
}
</script>