<template>
    <div class="min-h-screen bg-background-primary">
        <div class="container mx-auto px-6 py-16">
            <h1 class="text-4xl font-bold mb-8 text-accent-primary">
                Сторінка показує всі кнопки які є в дизайн системі сайту
            </h1>

            <div class="space-y-12">
                <div v-for="style in buttonStyles" :key="style.name" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div v-for="size in buttonSizes" :key="`${style.name}-${size.name}`" class="p-6">
                            <div class="flex justify-center">
                                <MainButton :size="size.name" :buttonStyle="style.name" @click="handleClick">
                                    Button
                                </MainButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const clickCount = ref(0)

// Button configuration data
const buttonSizes = [
    { name: 'S', label: 'S' },
    { name: 'M', label: 'M' }
]

const buttonStyles = [
    { name: 'primary', label: 'Primary' },
    { name: 'secondary', label: 'Secondary' },
    { name: 'ghost', label: 'Ghost' }
]

const demoButtons = [
    { size: 'S', style: 'primary', label: 'Small Primary' },
    { size: 'M', style: 'secondary', label: 'Medium Secondary' },
    { size: 'M', style: 'ghost', label: 'Medium Ghost' }
]

const handleClick = () => {
    clickCount.value++
    console.log('Button clicked!')
}
</script>
