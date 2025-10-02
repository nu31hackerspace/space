import { useState } from '#app'
import { onMounted, watchEffect } from 'vue'
import { trackEvent } from '~/utils/track'

export const useTheme = () => {
    const theme = useState<'light' | 'dark'>('theme', () => 'light')

    const toggleTheme = () => {
        theme.value = theme.value === 'dark' ? 'light' : 'dark'
        trackEvent('toggle_theme', { newTheme: theme.value })
    }

    onMounted(() => {
        const savedTheme = localStorage.getItem('theme') as
            | 'light'
            | 'dark'
            | null
        if (savedTheme) {
            theme.value = savedTheme
        } else {
            const prefersDark = window.matchMedia(
                '(prefers-color-scheme: dark)'
            ).matches
            theme.value = prefersDark ? 'dark' : 'light'
        }

        watchEffect(() => {
            // Update localStorage
            localStorage.setItem('theme', theme.value)
            // Update the class on the <html> element
            if (theme.value === 'dark') {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        })
    })

    return {
        theme,
        toggleTheme,
    }
}
