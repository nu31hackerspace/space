import tailwindcss from '@tailwindcss/vite'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { firstCommitDate } from './scripts/blog-commit-date.mjs'

const blogDirectory = join(process.cwd(), 'content/blog')
const blogRoutes = readdirSync(blogDirectory)
    .filter((name) => name.endsWith('.md'))
    .map((name) => `/blog/${name.slice(0, -3)}`)
const datesFile = join(process.cwd(), '.blog-dates.generated.json')
const exportedDates: Record<string, string> = existsSync(datesFile)
    ? JSON.parse(readFileSync(datesFile, 'utf8'))
    : {}

/** Resolve an optional frontmatter date to a timestamp stored in the collection. */
function blogDate(filePath: string, value?: string): string {
    const sourcePath = relative(process.cwd(), filePath)
    const sourceDate =
        (value?.trim() || undefined) ??
        firstCommitDate(filePath) ??
        exportedDates[sourcePath] ??
        statSync(filePath).birthtime
    const date = new Date(sourceDate)
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid blog date in ${filePath}`)
    }
    return date.toISOString()
}

export default defineNuxtConfig({
    modules: ['@nuxt/content'],
    content: {
        build: {
            markdown: {
                // Titles come from frontmatter; keep Markdown H1 in the article body.
                contentHeading: false,
            },
        },
        renderer: {
            anchorLinks: false,
        },
    },
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    imports: {
        autoImport: false,
    },
    pages: true,
    nitro: {
        prerender: {
            routes: ['/blog', '/rss.xml', ...blogRoutes],
        },
    },
    runtimeConfig: {
        public: {
            baseUrl: 'http://localhost:3000',
            gitCommitSha: 'local',
        },
    },
    vite: {
        plugins: [tailwindcss()],
        server: {
            proxy: {
                '/api': {
                    target: process.env.BACKEND_URL ?? 'http://localhost:3001',
                    changeOrigin: true,
                },
            },
        },
        vue: {
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag === 'gancio-events',
                },
            },
        },
    },
    css: ['~/assets/css/main.css'],
    hooks: {
        'content:file:afterParse'({ file, content, collection }) {
            if (collection.name !== 'blog' || !file.path) return
            content.date = blogDate(file.path, content.date)
        },
    },
    app: {
        head: {
            link: [
                {
                    rel: 'alternate',
                    type: 'application/rss+xml',
                    title: 'NU31 Space Blog',
                    href: 'https://nu31.space/rss.xml',
                },
            ],
            script: [
                {
                    innerHTML: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}})()`,
                    type: 'text/javascript',
                },
            ],
        },
    },
})
