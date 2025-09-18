<template>
    <component
        :is="link ? 'a' : 'button'"
        :class="[
            'inline-flex items-center justify-center font-semibold rounded-lg gap-2',
            variantClasses[buttonStyle],
            sizeClasses[size],
        ]"
        :href="link"
        :target="link ? '_blank' : undefined"
        :rel="link ? 'noopener noreferrer' : undefined"
        @click="link ? undefined : $emit('click', $event)"
    >
        <span
            v-if="icon"
            class="flex items-center"
        >
            <Icon
                :icon="icon"
                :class="iconSizeClasses[size]"
            />
        </span>
        {{ label }}
        <slot />
    </component>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
    label?: string
    size?: 'S' | 'M' | 'L'
    buttonStyle?: 'primary' | 'secondary' | 'ghost'
    state?: 'default' | 'disabled'
    link?: string
    icon?: string
}

interface Emits {
    (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<Props>(), {
    label: '',
    size: 'M',
    buttonStyle: 'primary',
    state: 'default',
    link: '',
    icon: '',
})

defineEmits<Emits>()

const sizeClasses = {
    S: 'px-2 py-2 text-xs font-bold',
    M: 'px-4 py-3 text-sm font-bold',
    L: 'px-6 py-4 text-base font-bold',
}

const iconSizeClasses = {
    S: 'w-4 h-4',
    M: 'w-6 h-6',
    L: 'w-8 h-8',
}

const variantClasses = {
    primary:
        'bg-accent-primary hover:bg-accent-secondary text-background-primary',
    secondary: 'bg-fill-tertiary hover:bg-fill-secondary text-label-primary',
    ghost: 'bg-transparent hover:bg-fill-tertiary text-label-primary',
}
</script>
