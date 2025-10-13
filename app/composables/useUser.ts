import { ref, computed } from 'vue'
import { useFetch } from '#imports'

export type User = {
    id: string
    name: string
    username: string
    avatarFilename?: string
}

const user = ref<User | null>(null)
const isLoading = ref(false)

export const useUser = () => {
    const fetchUser = async () => {
        isLoading.value = true
        try {
            const response = await $fetch<{ user: User | null }>('/api/user/me', {
                credentials: 'include'
            })
            if (response.user) {
                user.value = response.user
            } else {
                user.value = null
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
            user.value = null
        } finally {
            isLoading.value = false
        }
    }

    const isLoggedIn = computed(() => user.value !== null)

    const avatarUrl = computed(() => {
        if (user.value?.id) {
            return `/api/user/${user.value.id}/avatar.png`
        }
        return null
    })

    const logout = async () => {
        try {
            await $fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
            user.value = null
            window.location.href = '/'
        } catch (error) {
            console.error('Failed to logout:', error)
            document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
            user.value = null
            window.location.href = '/'
        }
    }

    return {
        user,
        isLoggedIn,
        isLoading,
        avatarUrl,
        fetchUser,
        logout,
    }
}

