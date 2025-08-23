import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
    darkMode: 'class',
    content: [
        './app/**/*.{vue,js,ts,jsx,tsx}',
        './components/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        colors: {
            'background-primary': 'var(--color-background-primary)',

            'fill-secondary': 'var(--color-fill-secondary)',
            'fill-tertiary': 'var(--color-fill-tertiary)',

            'label-primary': 'var(--color-label-primary)',
            'label-secondary': 'var(--color-label-secondary)',
            'label-tertiary': 'var(--color-label-tertiary)',

            'accent-primary': 'var(--color-accent-primary)',
            'accent-secondary': 'var(--color-accent-secondary)',

            'separator-primary': 'var(--color-separator-primary)',
            'separator-secondary': 'var(--color-separator-secondary)',
        },
        extend: {
        }
    },
    plugins: [],
}