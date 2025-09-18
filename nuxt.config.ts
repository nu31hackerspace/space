import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    imports: {
        autoImport: false,
    },
    pages: true,
    runtimeConfig: {
        mongoUri: 'mongodb://localhost:27017/nu31space',
        discordClientSecret: '',
        public: {
            baseUrl: 'http://localhost:3000',
            gitCommitSha: 'local',
            discordClientId: '1418277247005229096',
        },
    },
    vite: {
        plugins: [tailwindcss()],
    },
    css: ['~/assets/css/main.css'],
})
