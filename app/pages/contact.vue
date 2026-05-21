<template>
    <div class="container mx-auto px-6 py-16 max-w-4xl">
        <h1 class="text-4xl font-bold mb-4 text-accent-primary">Contact</h1>
        <p class="text-lg text-label-secondary mb-12">
            HACKER SPACE NU31 — registered nonprofit organization in Ukraine,
            EDRPOU 46237412.
        </p>

        <section class="mb-12 bg-fill-secondary p-8 rounded-xl border border-separator-primary">
            <h2 class="text-2xl font-bold mb-4 text-accent-primary">
                Registered address
            </h2>
            <address class="not-italic text-lg text-label-primary whitespace-pre-line mb-4">{{ legalAddress }}</address>
            <a
                :href="mapsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-accent-primary hover:underline"
            >
                <Icon icon="mdi:map-marker" class="w-5 h-5" />
                View on Google Maps
            </a>
        </section>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-4 text-accent-primary">Email</h2>
            <p class="text-lg text-label-primary">
                <a
                    href="mailto:root@nu31.space"
                    class="text-accent-primary hover:underline"
                >
                    root@nu31.space
                </a>
            </p>
            <p class="text-label-secondary mt-2">
                Use this address for organizational, legal, press, and
                partnership enquiries.
            </p>
        </section>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-4 text-accent-primary">
                Online presence
            </h2>
            <ul class="space-y-2 text-label-primary">
                <li>
                    GitHub:
                    <a
                        href="https://github.com/nu31hackerspace"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-accent-primary hover:underline"
                    >
                        github.com/nu31hackerspace
                    </a>
                </li>
                <li>
                    Discord:
                    <a
                        href="https://discord.gg/X93qAG2jH6"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-accent-primary hover:underline"
                    >
                        discord.gg/X93qAG2jH6
                    </a>
                </li>
                <li>
                    Instagram:
                    <a
                        href="https://www.instagram.com/nu31hackerspace/"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-accent-primary hover:underline"
                    >
                        instagram.com/nu31hackerspace
                    </a>
                </li>
                <li>
                    Patreon:
                    <a
                        href="https://www.patreon.com/cw/NU31"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-accent-primary hover:underline"
                    >
                        patreon.com/cw/NU31
                    </a>
                </li>
                <li>
                    Events:
                    <a
                        href="https://events.nu31.space"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-accent-primary hover:underline"
                    >
                        events.nu31.space
                    </a>
                </li>
            </ul>
        </section>

        <section>
            <h2 class="text-2xl font-bold mb-4 text-accent-primary">
                Legal documents
            </h2>
            <p class="text-label-primary">
                Founding documents, the statute, and the official EDR extract
                are available on the
                <NuxtLink to="/legal-docs" class="text-accent-primary hover:underline">
                    legal documents page
                </NuxtLink>.
            </p>
        </section>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useHead } from '#imports'
import { Icon } from '@iconify/vue'

definePageMeta({
    layout: 'default',
})

useHead({
    title: 'Contact — HACKER SPACE NU31',
    meta: [
        {
            name: 'description',
            content:
                'Contact HACKER SPACE NU31, a registered nonprofit organization in Ukraine (EDRPOU 46237412). Address, email, and social channels.',
        },
    ],
})

const legalAddress = `HACKERSPACE NU31
Nyzhnoiurkivska
Kyiv; Kyiv 04080`

const mapsUrl = 'https://maps.app.goo.gl/HyjnMv37owj5GYHm8'
</script>
