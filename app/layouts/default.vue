<template>
    <div class="bg-background-primary overflow-x-hidden max-w-full min-h-screen">
        <Header />
        <div class="flex flex-col min-h-screen">
            <main class="flex-grow">
                <slot />
            </main>
        </div>
        <Footer />
    </div>
</template>

<script setup lang="ts"></script>
