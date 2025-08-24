<template>
  <div class="min-h-screen bg-background-primary text-label-primary">
    <div class="relative h-screen">
      <div class="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20 z-10"></div>
      <img src="https://placehold.co/1920x1080" alt="NU31 Hacker Space" class="w-full h-full object-cover" />
      <div class="absolute inset-0 z-20 flex items-center justify-center">
        <div class="text-center text-white">
          <h1 class="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            NU31
          </h1>
          <p class="text-2xl md:text-3xl mb-8 font-light">
            Хакерспейс у Києві
          </p>
          <p class="text-xl md:text-2xl font-semibold text-accent-primary">
            Створюй що завгодно
          </p>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-6 py-16">
      <div class="max-w-4xl mx-auto text-center mb-20">
        <h2 class="text-4xl font-bold mb-8 text-accent-primary">
          Про наш хакерспейс
        </h2>
        <p class="text-xl text-label-secondary leading-relaxed">
          NU31 — це простір для творчих людей, інноваторів та ентузіастів технологій.
          Ми створюємо середовище, де можна експериментувати, навчатися та реалізовувати
          найсміливіші ідеї.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        <div class="bg-fill-secondary p-8 rounded-xl border border-separator-primary hover:shadow-lg transition-all">
          <div class="w-16 h-16 bg-accent-primary rounded-full flex items-center justify-center mb-6 mx-auto">
            <svg class="w-8 h-8 text-background-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z">
              </path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-4 text-center">Творчість та Інновації</h3>
          <p class="text-label-secondary text-center">
            Простір для реалізації найсміливіших технічних ідей та творчих проектів
          </p>
        </div>

        <div class="bg-fill-tertiary p-8 rounded-xl border border-separator-secondary hover:shadow-lg transition-all">
          <div class="w-16 h-16 bg-accent-secondary rounded-full flex items-center justify-center mb-6 mx-auto">
            <svg class="w-8 h-8 text-background-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
              </path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-4 text-center">Навчання та Розвиток</h3>
          <p class="text-label-secondary text-center">
            Майстер-класи, воркшопи та обмін знаннями між учасниками спільноти
          </p>
        </div>

        <div class="bg-fill-secondary p-8 rounded-xl border border-separator-primary hover:shadow-lg transition-all">
          <div class="w-16 h-16 bg-accent-primary rounded-full flex items-center justify-center mb-6 mx-auto">
            <svg class="w-8 h-8 text-background-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
              </path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold mb-4 text-center">Спільнота</h3>
          <p class="text-label-secondary text-center">
            Зустрічі з однодумцями, нетворкінг та співпраця над спільними проектами
          </p>
        </div>
      </div>

      <div class="text-center mb-20">
        <h2 class="text-3xl font-bold mb-6 text-accent-primary">
          Приєднуйся до нас
        </h2>
        <p class="text-xl text-label-secondary mb-8">
          Знаходимося в серці Києва, Україна
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://discord.gg/pNGVFb6d" target="_blank" rel="noopener"
            class="px-8 py-4 bg-accent-primary text-background-primary rounded-lg hover:bg-accent-secondary transition-colors font-semibold flex items-center justify-center">
            Ми тусимо в Discord, приєднуйся!
          </a>
        </div>
      </div>

      <div class="border-t border-separator-primary pt-16">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-2xl font-bold mb-4 text-accent-primary">Контакти</h3>
            <p class="text-label-secondary mb-2">📍 Київ, Україна</p>
            <p class="text-label-secondary mb-2">📧 Нижньоюківська 31</p>
          </div>
          <div>
            <h3 class="text-2xl font-bold mb-4 text-accent-primary">Соціальні мережі</h3>
            <div class="flex space-x-4">
              <a href="https://www.instagram.com/nu31hackerspace/"
                class="text-accent-primary hover:text-accent-secondary transition-colors">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://discord.gg/pNGVFb6d"
                class="text-accent-primary hover:text-accent-secondary transition-colors">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.07.07 0 00-.073.035c-.211.375-.444.864-.608 1.249a18.524 18.524 0 00-5.487 0 12.51 12.51 0 00-.617-1.249.07.07 0 00-.073-.035c-1.653.285-3.36.802-4.885 1.515a.064.064 0 00-.03.027C.533 8.063-.32 11.58.099 15.057a.08.08 0 00.028.056c2.06 1.515 4.063 2.43 6.033 3.03a.07.07 0 00.076-.027c.464-.638.878-1.312 1.226-2.025a.07.07 0 00-.038-.097c-.662-.25-1.292-.548-1.9-.884a.07.07 0 01-.007-.117c.128-.097.256-.198.378-.3a.07.07 0 01.073-.01c3.993 1.825 8.317 1.825 12.267 0a.07.07 0 01.074.009c.122.102.25.203.378.3a.07.07 0 01-.007.117 12.298 12.298 0 01-1.9.884.07.07 0 00-.038.097c.36.713.773 1.387 1.227 2.025a.07.07 0 00.076.027c1.97-.6 3.973-1.515 6.033-3.03a.08.08 0 00.028-.056c.5-4.09-.838-7.575-3.548-10.661a.061.061 0 00-.03-.027zM8.02 14.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.213 0 2.177 1.096 2.157 2.418 0 1.334-.955 2.419-2.157 2.419zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.213 0 2.177 1.096 2.157 2.418 0 1.334-.944 2.419-2.157 2.419z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button @click="toggleTheme"
      class="fixed bottom-6 right-6 w-12 h-12 bg-accent-secondary text-background-primary rounded-full hover:bg-accent-primary transition-colors shadow-lg">
      <svg v-if="!isDark" class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
      </svg>
      <svg v-else class="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z">
        </path>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

let isDark = ref(false)
const toggleTheme = () => {
  isDark.value = !isDark.value
  console.log(isDark.value)
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  }
}
</script>
