<template>
    <div class="container mx-auto px-6 py-16 max-w-4xl">
        <h1 class="text-4xl font-bold mb-4 text-accent-primary">
            About HACKER SPACE NU31
        </h1>
        <p class="text-lg text-label-secondary mb-12">
            Хакерспейс у Києві / Hackerspace in Kyiv, Ukraine
        </p>

        <section class="mb-12 bg-fill-secondary p-8 rounded-xl border border-separator-primary">
            <h2 class="text-2xl font-bold mb-4 text-accent-primary">
                Legal information
            </h2>
            <dl class="grid grid-cols-1 sm:grid-cols-[max-content_1fr] gap-x-6 gap-y-3 text-label-primary">
                <dt class="font-semibold text-label-secondary">Legal name</dt>
                <dd>HACKER SPACE NU31</dd>

                <dt class="font-semibold text-label-secondary">EDRPOU / ЄДРПОУ</dt>
                <dd>46237412</dd>

                <dt class="font-semibold text-label-secondary">Country</dt>
                <dd>Ukraine</dd>

                <dt class="font-semibold text-label-secondary">Registered address</dt>
                <dd>
                    <span class="whitespace-pre-line block">{{ legalAddress }}</span>
                    <a
                        :href="mapsUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-block mt-2 text-accent-primary hover:underline"
                    >
                        View on Google Maps →
                    </a>
                </dd>

                <dt class="font-semibold text-label-secondary">Contact email</dt>
                <dd>
                    <a
                        href="mailto:root@nu31.space"
                        class="text-accent-primary hover:underline"
                    >
                        root@nu31.space
                    </a>
                </dd>
            </dl>
        </section>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-4 text-accent-primary">
                Nonprofit status
            </h2>
            <p class="text-lg text-label-primary mb-4">
                HACKER SPACE NU31 is a registered nonprofit organization
                (громадська організація) in Ukraine, registered under EDRPOU
                46237412. The organization operates on a non-commercial basis;
                all income is reinvested into the hackerspace, its equipment,
                and its community activities.
            </p>
            <p class="text-label-secondary">
                Founding and registration documents — the statute (Статут),
                founding protocol, register of founders, governance details,
                ownership structure, and the official EDR extract (Виписка) —
                are published on the
                <NuxtLink to="/legal-docs" class="text-accent-primary hover:underline">
                    legal documents page
                </NuxtLink>.
            </p>
        </section>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-4 text-accent-primary">
                Mission
            </h2>
            <p class="text-lg text-label-primary mb-4">
                NU31 exists to give creators, engineers, makers, and
                technology enthusiasts in Kyiv a shared physical space and a
                community in which to learn, build, and collaborate. We host
                open workshops, lectures, and project nights, maintain
                shared tools and infrastructure, and support open-source
                projects developed by our members.
            </p>
            <p class="text-label-primary">
                We are part of the broader international hackerspace
                movement: a member-run, openly accessible community space
                operated for the public benefit rather than for profit.
            </p>
        </section>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-4 text-accent-primary">
                What we do
            </h2>
            <ul class="list-disc pl-6 space-y-2 text-label-primary">
                <li>
                    Operate a community workshop with shared tools,
                    electronics benches, and project space.
                </li>
                <li>
                    Run regular meetups, workshops, and lectures open to the
                    public.
                </li>
                <li>
                    Develop and maintain open-source projects, including
                    Prismo — an IoT smart-locker system used by the
                    hackerspace itself.
                </li>
                <li>
                    Support members working on personal and group technical
                    projects.
                </li>
            </ul>
            <p class="mt-4 text-label-secondary">
                See the
                <NuxtLink to="/projects" class="text-accent-primary hover:underline">
                    Projects page
                </NuxtLink>
                for details on current activities.
            </p>
        </section>

        <section>
            <h2 class="text-2xl font-bold mb-4 text-accent-primary">
                Founding context
            </h2>
            <p class="text-label-primary">
                NU31 was founded by a group of Kyiv-based engineers and
                makers who wanted a permanent, member-run space dedicated to
                technical creativity and community education. The
                organization was formally registered as a Ukrainian civic
                organization (громадська організація) and entered into the
                Unified State Register under EDRPOU 46237412. The space
                takes its name from its street address in Kyiv.
            </p>
        </section>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useHead } from '#imports'

definePageMeta({
    layout: 'default',
})

useHead({
    title: 'About — HACKER SPACE NU31',
    meta: [
        {
            name: 'description',
            content:
                'HACKER SPACE NU31 — registered nonprofit organization in Ukraine, EDRPOU 46237412. Community hackerspace in Kyiv.',
        },
    ],
})

const legalAddress = `HACKERSPACE NU31
Nyzhnoiurkivska
Kyiv; Kyiv 04080`

const mapsUrl = 'https://maps.app.goo.gl/HyjnMv37owj5GYHm8'
</script>
