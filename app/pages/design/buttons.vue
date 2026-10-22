<template>
    <div class="min-h-screen bg-background-primary">
        <div class="container mx-auto px-6 py-16">
            <h1 class="text-4xl font-bold mb-8 text-accent-primary">
                Сторінка показує всі кнопки які є в дизайн системі сайту
            </h1>

            <div class="space-y-12">
                <div
                    v-for="style in buttonStyles"
                    :key="style.name"
                    class="space-y-6"
                >
                    <h2 class="text-2xl font-semibold text-accent-primary">
                        {{ style.label }}
                    </h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            v-for="size in buttonSizes"
                            :key="`${style.name}-${size.name}`"
                            class="p-6"
                        >
                            <div class="flex flex-col gap-4">
                                <div class="text-center">
                                    <h3
                                        class="text-lg font-medium mb-2 text-accent-primary"
                                    >
                                        {{ size.label }} Size
                                    </h3>
                                    <MainButton
                                        :size="size.name"
                                        :button-style="style.name"
                                        label="Button"
                                        @click="handleClick"
                                    ></MainButton>
                                </div>
                                <div class="text-center">
                                    <h3
                                        class="text-lg font-medium mb-2 text-accent-primary"
                                    >
                                        {{ size.label }} with Icon
                                    </h3>
                                    <MainButton
                                        :size="size.name"
                                        :button-style="style.name"
                                        label="Button"
                                        icon="mdi:heart"
                                        @click="handleClick"
                                    ></MainButton>
                                </div>
                                <div class="text-center">
                                    <h3
                                        class="text-lg font-medium mb-2 text-accent-primary"
                                    >
                                        {{ size.label }} Icon Only
                                    </h3>
                                    <MainButton
                                        :size="size.name"
                                        :button-style="style.name"
                                        icon="mdi:star"
                                        @click="handleClick"
                                    ></MainButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="mt-16 p-8 bg-fill-secondary rounded-xl border border-separator-primary"
            >
                <h2 class="text-2xl font-bold mb-6 text-accent-primary">
                    Icon Examples
                </h2>
                <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    <MainButton
                        button-style="primary"
                        size="M"
                        label="Download"
                        icon="mdi:download"
                        @click="handleClick"
                    />
                    <MainButton
                        button-style="secondary"
                        size="M"
                        label="Settings"
                        icon="mdi:cog"
                        @click="handleClick"
                    />
                    <MainButton
                        button-style="ghost"
                        size="M"
                        label="Share"
                        icon="mdi:share"
                        @click="handleClick"
                    />
                    <MainButton
                        button-style="primary"
                        size="S"
                        label="Like"
                        icon="mdi:thumb-up"
                        @click="handleClick"
                    />
                    <MainButton
                        button-style="secondary"
                        size="S"
                        label="Edit"
                        icon="mdi:pencil"
                        @click="handleClick"
                    />
                    <MainButton
                        button-style="ghost"
                        size="S"
                        label="Delete"
                        icon="mdi:delete"
                        @click="handleClick"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { trackEvent } from '~~/app/utils/track'

onMounted(() => {
    trackEvent('page_view', { page: 'design_sandbox_buttons' })
})

const clickCount = ref(0)

const buttonSizes = [
    { name: 'S', label: 'S' },
    { name: 'M', label: 'M' },
]

const buttonStyles = [
    { name: 'primary', label: 'Primary' },
    { name: 'secondary', label: 'Secondary' },
    { name: 'ghost', label: 'Ghost' },
]

const handleClick = () => {
    clickCount.value++
    trackEvent('button_click', { button: 'design_sandbox_button' })
}
</script>
