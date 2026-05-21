<template>
    <div class="container mx-auto px-6 py-16 max-w-4xl">
        <h1 class="text-4xl font-bold mb-4 text-accent-primary">
            Projects & Activities
        </h1>
        <p class="text-lg text-label-secondary mb-12">
            What HACKER SPACE NU31 builds, hosts, and supports.
        </p>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-6 text-accent-primary">
                Open-source projects
            </h2>

            <article class="bg-fill-secondary p-8 rounded-xl border border-separator-primary mb-6">
                <h3 class="text-xl font-bold mb-2 text-label-primary">
                    Prismo — IoT smart-locker system
                </h3>
                <p class="text-label-primary mb-4">
                    Prismo is an open-source smart-locker system designed and
                    built by NU31 members for the hackerspace itself. It
                    combines microcontroller-driven locker hardware with an
                    MQTT-based backend so members can reserve, unlock, and
                    return shared storage compartments. The codebase, firmware,
                    and hardware notes are developed openly under the
                    organization's GitHub.
                </p>
                <a
                    href="https://github.com/nu31hackerspace"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-accent-primary hover:underline"
                >
                    github.com/nu31hackerspace
                </a>
            </article>

            <article class="bg-fill-secondary p-8 rounded-xl border border-separator-primary">
                <h3 class="text-xl font-bold mb-2 text-label-primary">
                    nu31.space — community platform
                </h3>
                <p class="text-label-primary">
                    The website itself, including resident login via Discord,
                    member-tracking utilities, an electricity-status indicator
                    for the physical space, and an events feed, is built and
                    maintained by NU31 members as an open-source project.
                </p>
            </article>
        </section>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-6 text-accent-primary">
                Community events
            </h2>
            <p class="text-label-primary mb-4">
                We host regular events open to the broader Kyiv community:
                technical workshops, lectures, hands-on project nights, and
                informal meetups. Topics span electronics, embedded systems,
                3D printing, software development, and adjacent creative
                disciplines.
            </p>
            <p class="text-label-secondary">
                Upcoming events are published live on the
                <NuxtLink to="/" class="text-accent-primary hover:underline">
                    homepage
                </NuxtLink>
                and on our public events calendar at
                <a
                    href="https://events.nu31.space"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-accent-primary hover:underline"
                >
                    events.nu31.space
                </a>.
            </p>
        </section>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-6 text-accent-primary">
                Member projects
            </h2>
            <p class="text-label-primary">
                NU31 supports a range of member-led projects that use the
                shared space and tools: custom electronics, robotics
                experiments, retro-computing restoration, CNC and 3D-printing
                work, embedded firmware research, and software for the
                community. Members write about ongoing work on the
                <NuxtLink to="/blog" class="text-accent-primary hover:underline">
                    blog
                </NuxtLink>.
            </p>
        </section>

        <section>
            <h2 class="text-2xl font-bold mb-6 text-accent-primary">
                Shared infrastructure
            </h2>
            <p class="text-label-primary">
                The hackerspace operates shared infrastructure for its
                members and the public, including workshop tools, electronics
                benches, networking and server resources for hosting
                community services, and the physical meeting space in Kyiv.
                All of it is maintained on a nonprofit basis under the legal
                entity HACKER SPACE NU31 (EDRPOU 46237412).
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
    title: 'Projects — HACKER SPACE NU31',
    meta: [
        {
            name: 'description',
            content:
                'Open-source projects, community events, and member work at HACKER SPACE NU31 — a nonprofit hackerspace in Kyiv, Ukraine.',
        },
    ],
})
</script>
