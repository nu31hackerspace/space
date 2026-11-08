import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { REDIRECTS } from '~/utils/redirects'

export default defineNuxtRouteMiddleware((to) => {
    // Ignore a trailing slash so '/old/' redirects the same as '/old'.
    const path =
        to.path.length > 1 && to.path.endsWith('/')
            ? to.path.slice(0, -1)
            : to.path
    const target = REDIRECTS.get(path)
    if (target) {
        return navigateTo(
            { path: target, query: to.query, hash: to.hash },
            { redirectCode: 301 }
        )
    }
})
