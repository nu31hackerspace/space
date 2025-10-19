import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useUser } from '~/composables/useUser'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const { isLoggedIn } = useUser()

    if (!isLoggedIn.value) {
        await navigateTo('/')
        return
    }
})

