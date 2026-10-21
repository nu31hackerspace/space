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
        public: {
            baseUrl: 'http://localhost:3000',
            gitCommitSha: 'local',
        },
    },
    vite: {
        plugins: [tailwindcss()],
        vue: {
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag === 'gancio-events',
                },
            },
        },
    },
    css: ['~/assets/css/main.css'],
    app: {
        head: {
            script: [
                {
                    innerHTML: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}})()`,
                    type: 'text/javascript',
                },
            ],
        },
    },
})
