<template>
    <footer class="border-t border-separator-primary mt-auto">
        <div class="container mx-auto px-4 py-8">
            <div
                class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
            >
                <div>
                    <h3 class="text-base font-bold text-accent-primary mb-3">
                        HACKER SPACE NU31
                    </h3>
                    <p class="text-sm text-label-secondary mb-1">
                        EDRPOU / ЄДРПОУ: 46237412
                    </p>
                    <p class="text-sm text-label-secondary">
                        Registered nonprofit organization in Ukraine
                    </p>
                </div>
                <div>
                    <h3 class="text-base font-bold text-accent-primary mb-3">
                        Contact
                    </h3>
                    <address class="not-italic text-sm text-label-secondary whitespace-pre-line mb-2">{{ legalAddress }}</address>
                    <a
                        href="mailto:root@nu31.space"
                        class="text-sm text-label-secondary hover:text-accent-primary transition-colors"
                    >
                        root@nu31.space
                    </a>
                </div>
                <div>
                    <h3 class="text-base font-bold text-accent-primary mb-3">
                        Navigation
                    </h3>
                    <ul class="space-y-1">
                        <li>
                            <NuxtLink
                                to="/about"
                                class="text-sm text-label-secondary hover:text-accent-primary transition-colors"
                            >
                                About
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink
                                to="/projects"
                                class="text-sm text-label-secondary hover:text-accent-primary transition-colors"
                            >
                                Projects
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink
                                to="/contact"
                                class="text-sm text-label-secondary hover:text-accent-primary transition-colors"
                            >
                                Contact
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink
                                to="/blog"
                                class="text-sm text-label-secondary hover:text-accent-primary transition-colors"
                            >
                                Blog
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>
            <div
                class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 pt-6 border-t border-separator-primary"
            >
                <div class="text-sm text-label-secondary text-center md:text-left">
                    © {{ currentYear }} HACKER SPACE NU31. All rights reserved.
                </div>
                <div class="flex space-x-6">
                    <NuxtLink
                        to="/privacy-policy"
                        class="text-sm text-label-secondary hover:text-accent-primary transition-colors"
                    >
                        Privacy Policy
                    </NuxtLink>
                    <NuxtLink
                        to="/legal-docs"
                        class="text-sm text-label-secondary hover:text-accent-primary transition-colors"
                    >
                        Документи
                    </NuxtLink>
                    <NuxtLink
                        to="/terms-of-service"
                        class="text-sm text-label-secondary hover:text-accent-primary transition-colors"
                    >
                        Terms of Service
                    </NuxtLink>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
const legalAddress = `HACKERSPACE NU31
Nyzhnoiurkivska
Kyiv; Kyiv 04080`
</script>
