<template>
    <div
        class="bg-background-primary overflow-x-hidden max-w-full min-h-screen flex flex-col"
    >
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <NuxtLink
                    to="/home"
                    class="text-3xl font-bold text-accent-primary hover:opacity-80 transition-opacity"
                >
                    NU31
                </NuxtLink>
                <div class="flex items-center space-x-4">
                    <ThemeSwitch />
                </div>
            </div>
        </div>
        <slot class="min-h-screen" />
        <Footer />
    </div>
</template>

<script setup lang="ts"></script>
