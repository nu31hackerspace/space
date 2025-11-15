import { ref, computed } from 'vue'
import { useRuntimeConfig } from '#imports'

type Status = 'online' | 'offline'

type ApiResponse = {
    current: { status: Status; lastAliveAt?: string; since?: string }
}

const status = ref<Status | null>(null)
const isLoading = ref(false)

export const useElectricityStatus = () => {
    const config = useRuntimeConfig()
    const slug = config.public.spaceElectricityTrackerSlug as string

    const fetchStatus = async () => {
        isLoading.value = true
        try {
            const response = await $fetch<ApiResponse>(
                `/api/electricty_tracker/${slug}/history`
            )
            if (response?.current?.status) {
                status.value = response.current.status
            } else {
                status.value = 'offline'
            }
        } catch (error) {
            console.error('Failed to fetch electricity status:', error)
            status.value = 'offline'
        } finally {
            isLoading.value = false
        }
    }

    const badgeVariant = computed(() => {
        if (status.value === 'online') {
            return 'success'
        }
        return 'error'
    })

    const badgeLabel = computed(() => {
        if (status.value === 'online') {
            return 'світло є'
        }
        return 'світла немає'
    })

    return {
        status,
        isLoading,
        badgeVariant,
        badgeLabel,
        fetchStatus,
    }
}

