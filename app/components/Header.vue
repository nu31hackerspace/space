<template>
    <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <NuxtLink
                    to="/"
                    class="flex flex-col hover:opacity-80 transition-opacity"
                >
                    <span
                        class="text-3xl font-bold text-accent-primary leading-none"
                    >
                        NU31
                    </span>
                    <span
                        class="text-[10px] uppercase tracking-wider text-label-secondary mt-1"
                    >
                        HACKER SPACE NU31
                    </span>
                </NuxtLink>
            </div>
            <nav class="flex items-center space-x-6">
                <NuxtLink
                    to="/about"
                    class="text-label-primary hover:text-accent-primary transition-colors font-medium"
                >
                    About
                </NuxtLink>
                <NuxtLink
                    to="/projects"
                    class="text-label-primary hover:text-accent-primary transition-colors font-medium"
                >
                    Projects
                </NuxtLink>
                <NuxtLink
                    to="/contact"
                    class="text-label-primary hover:text-accent-primary transition-colors font-medium"
                >
                    Contact
                </NuxtLink>
                <NuxtLink
                    to="/merch"
                    class="text-label-primary hover:text-accent-primary transition-colors font-medium"
                >
                    Merch
                </NuxtLink>
            </nav>
            <div class="flex items-center space-x-4">
                <ElectricityStatus />
                <ThemeSwitch />
            </div>
        </div>
    </div>
</template>
