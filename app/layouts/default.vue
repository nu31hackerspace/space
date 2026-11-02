<template>
    <div
        class="bg-background-primary overflow-x-hidden max-w-full min-h-screen flex flex-col"
    >
        <Header />
        <main class="flex-grow">
            <slot />
        </main>
        <Footer />
    </div>
</template>

<script setup lang="ts"></script>
