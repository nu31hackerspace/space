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
                                        :buttonStyle="style.name"
                                        @click="handleClick"
                                        label="Button"
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
                                        :buttonStyle="style.name"
                                        @click="handleClick"
                                        label="Button"
                                        icon="mdi:heart"
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
                                        :buttonStyle="style.name"
                                        @click="handleClick"
                                        icon="mdi:star"
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
                        buttonStyle="primary"
                        size="M"
                        @click="handleClick"
                        label="Download"
                        icon="mdi:download"
                    />
                    <MainButton
                        buttonStyle="secondary"
                        size="M"
                        @click="handleClick"
                        label="Settings"
                        icon="mdi:cog"
                    />
                    <MainButton
                        buttonStyle="ghost"
                        size="M"
                        @click="handleClick"
                        label="Share"
                        icon="mdi:share"
                    />
                    <MainButton
                        buttonStyle="primary"
                        size="S"
                        @click="handleClick"
                        label="Like"
                        icon="mdi:thumb-up"
                    />
                    <MainButton
                        buttonStyle="secondary"
                        size="S"
                        @click="handleClick"
                        label="Edit"
                        icon="mdi:pencil"
                    />
                    <MainButton
                        buttonStyle="ghost"
                        size="S"
                        @click="handleClick"
                        label="Delete"
                        icon="mdi:delete"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

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
    console.log('Button clicked!')
}
</script>
