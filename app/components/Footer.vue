<template>
    <footer class="border-t border-separator-primary mt-auto bg-background-primary">
        <div class="container mx-auto px-4 py-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                <!-- Column 1: Organization & Contact Info -->
                <div class="col-span-1">
                    <h3 class="text-base font-bold text-accent-primary mb-4">
                        HACKER SPACE NU31
                    </h3>
                    <div class="text-sm text-label-secondary space-y-2 mb-4">
                        <p>EDRPOU / ЄДРПОУ: 46237412</p>
                        <p>Registered nonprofit organization in Ukraine</p>
                    </div>
                    <address class="not-italic text-sm text-label-secondary whitespace-pre-line mb-4">📍 {{ legalAddress }}</address>
                    <div class="space-y-2">
                        <a href="mailto:root@nu31.space" class="text-sm text-label-secondary hover:text-accent-primary transition-colors flex items-center gap-2">
                            📧 root@nu31.space
                        </a>
                        <a href="https://maps.app.goo.gl/HyjnMv37owj5GYHm8" target="_blank" rel="noopener noreferrer" class="text-sm text-label-secondary hover:text-accent-primary transition-colors flex items-center gap-2">
                            🗺️ View on Google Maps
                        </a>
                    </div>
                </div>

                <!-- Column 2: Navigation -->
                <div class="col-span-1">
                    <h3 class="text-base font-bold text-accent-primary mb-4">
                        Меню
                    </h3>
                    <ul class="space-y-3">
                        <li><NuxtLink to="/about" class="text-sm text-label-secondary hover:text-accent-primary transition-colors">Про нас / About</NuxtLink></li>
                        <li><NuxtLink to="/projects" class="text-sm text-label-secondary hover:text-accent-primary transition-colors">Проєкти / Projects</NuxtLink></li>
                        <li><NuxtLink to="/links" class="text-sm text-label-secondary hover:text-accent-primary transition-colors">Посилання / Links</NuxtLink></li>


                        <li><NuxtLink to="/contact" class="text-sm text-label-secondary hover:text-accent-primary transition-colors">Контакти / Contact</NuxtLink></li>
                    </ul>
                </div>

                <!-- Column 3: Legal -->
                <div class="col-span-1">
                    <h3 class="text-base font-bold text-accent-primary mb-4">
                        Юридична інформація
                    </h3>
                    <ul class="space-y-3">
                        <li><NuxtLink to="/privacy-policy" class="text-sm text-label-secondary hover:text-accent-primary transition-colors">Privacy Policy</NuxtLink></li>
                        <li><NuxtLink to="/terms-of-service" class="text-sm text-label-secondary hover:text-accent-primary transition-colors">Terms of Service</NuxtLink></li>
                        <li><NuxtLink to="/legal-docs" class="text-sm text-label-secondary hover:text-accent-primary transition-colors">Документи</NuxtLink></li>
                    </ul>
                </div>

                <!-- Column 4: Socials -->
                <div class="col-span-1">
                    <h3 class="text-base font-bold text-accent-primary mb-4">
                        Соціальні мережі
                    </h3>
                    <div class="flex flex-wrap gap-2 -ml-3">
                        <MainButton buttonStyle="ghost" size="M" link="https://github.com/nu31hackerspace" icon="mdi:github" />
                        <MainButton buttonStyle="ghost" size="M" link="https://www.instagram.com/nu31hackerspace/" icon="mdi:instagram" />
                        <MainButton buttonStyle="ghost" size="M" link="https://discord.gg/X93qAG2jH6" icon="ic:baseline-discord" />
                        <MainButton buttonStyle="ghost" size="M" link="https://www.patreon.com/cw/NU31" icon="mdi:patreon" />
                        <MainButton buttonStyle="ghost" size="M" link="https://www.linkedin.com/company/nu31/" icon="mdi:linkedin" />
                    </div>
                </div>
            </div>

            <!-- Bottom Row -->
            <div class="flex justify-center md:justify-start items-center pt-6 border-t border-separator-primary">
                <div class="text-sm text-label-secondary">
                    © {{ currentYear }} HACKER SPACE NU31. All rights reserved.
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
