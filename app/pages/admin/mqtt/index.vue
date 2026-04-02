<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-accent-primary flex items-center gap-2">
                <Icon icon="mdi:security-network" /> MQTT Administration
            </h1>
        </div>

        <div class="space-y-10">
            <!-- Access Control Panel -->
            <div class="flex flex-col md:flex-row gap-6">
                <!-- User List -->
                <div class="md:w-2/3 bg-fill-secondary border border-separator-primary rounded-xl p-6 flex flex-col">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-semibold text-label-primary">Registered Devices / Users</h2>
                        <MainButton @click="refreshUsers" buttonStyle="ghost" size="S" icon="mdi:refresh" :disabled="pendingUsers">
                            Refresh
                        </MainButton>
                    </div>

                    <div v-if="pendingUsers" class="text-center text-label-secondary py-8">
                        <Icon icon="mdi:loading" class="animate-spin text-3xl mx-auto mb-2" />
                        <p>Loading users...</p>
                    </div>

                    <div v-else-if="usersList.length === 0" class="text-center text-label-secondary py-8">
                        <Icon icon="mdi:account-off-outline" class="text-4xl mx-auto mb-2 text-separator-primary" />
                        <p>No users found on the MQTT Broker.</p>
                    </div>

                    <div v-else class="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                        <div v-for="user in usersList" :key="user.username" class="bg-background-primary p-4 border border-separator-primary rounded-lg flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                                <div class="flex items-center gap-2 mb-2">
                                    <Icon icon="mdi:account-key" class="text-accent-primary" />
                                    <span class="font-semibold text-label-primary">{{ user.username }}</span>
                                    <span v-if="user.username === 'admin'" class="bg-red-500/10 text-red-400 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border border-red-500/20">System Root</span>
                                </div>
                                <div class="text-sm text-label-secondary mt-1">
                                    <div v-if="user.acls && user.acls.length">
                                        <div class="font-medium text-xs mb-1 uppercase tracking-widest text-label-secondary">Allowed Topics:</div>
                                        <div class="flex flex-wrap gap-2">
                                            <span v-for="(acl, idx) in deduplicateTopics(user.acls)" :key="idx"
                                                  class="font-mono text-xs bg-fill-tertiary px-2 py-1 rounded text-label-primary">
                                                {{ acl.topic }}
                                            </span>
                                        </div>
                                    </div>
                                    <div v-else class="text-xs italic text-label-secondary">No topic restrictions found</div>
                                    
                                    <div class="mt-2 flex items-center gap-2">
                                        <div v-if="addingTopicToUser === user.username" class="flex items-center gap-2 w-full max-w-xs">
                                            <input v-model="newTopic" type="text" placeholder="New topic path..." 
                                                class="flex-1 bg-background-primary border border-separator-primary rounded px-2 py-1 text-xs text-label-primary focus:outline-none focus:border-accent-primary" 
                                                @keyup.enter="submitAddTopic(user.username)" @keyup.escape="addingTopicToUser = null" />
                                            <button @click="submitAddTopic(user.username)" class="text-accent-primary hover:text-accent-secondary" title="Save topic"><Icon icon="mdi:check" /></button>
                                            <button @click="addingTopicToUser = null" class="text-label-secondary hover:text-label-primary" title="Cancel"><Icon icon="mdi:close" /></button>
                                        </div>
                                        <button v-else-if="user.username !== 'admin'" @click="startAddTopic(user.username)" class="text-xs text-accent-primary hover:underline flex items-center gap-1 mt-1">
                                            <Icon icon="mdi:plus" /> Add Topic
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <button v-if="user.username !== 'admin'" 
                                    @click="deleteUser(user.username)" 
                                    class="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-fill-tertiary"
                                    title="Revoke access">
                                    <Icon icon="mdi:trash-can-outline" class="text-xl" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Create Form -->
                <div class="md:w-1/3">
                    <div class="bg-fill-secondary border border-separator-primary rounded-xl p-6 sticky top-6">
                        <h2 class="text-lg font-semibold text-label-primary mb-4 flex items-center gap-2">
                            <Icon icon="mdi:account-plus-outline" /> New Device Access
                        </h2>
                        
                        <form @submit.prevent="submitCreateUser" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-label-secondary mb-1">Device Username</label>
                                <input v-model="newUser.username" type="text" required placeholder="e.g. 3d-printer-01"
                                    class="w-full bg-background-primary border border-separator-primary rounded-lg px-4 py-2 text-label-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-label-secondary mb-1">Password</label>
                                <input v-model="newUser.password" type="text" required placeholder="Strong generated key"
                                    class="w-full bg-background-primary border border-separator-primary rounded-lg px-4 py-2 text-label-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-label-secondary mb-1">Topic Path (Prefix)</label>
                                <input v-model="newUser.topic" type="text" required placeholder="e.g. device/3dprinter/#"
                                    class="w-full font-mono text-sm bg-background-primary border border-separator-primary rounded-lg px-4 py-2 text-label-primary focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary" />
                                <p class="text-xs text-label-secondary mt-1">Grants Read & Write access specifically to this topic.</p>
                            </div>

                            <div v-if="actionError" class="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
                                <Icon icon="mdi:alert-circle" class="mt-0.5 flex-shrink-0" />
                                <span>{{ actionError }}</span>
                            </div>

                            <MainButton type="submit" class="w-full justify-center" :disabled="creatingUser">
                                <Icon v-if="creatingUser" icon="mdi:loading" class="animate-spin mr-2" />
                                {{ creatingUser ? 'Creating...' : 'Grant Access' }}
                            </MainButton>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Live Topics Panel -->
            <div class="bg-fill-secondary border border-separator-primary rounded-xl p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg font-semibold text-label-primary flex items-center gap-2">
                        <Icon icon="mdi:access-point-network" /> Live Topics Monitor
                    </h2>
                    <MainButton @click="refreshSelected" buttonStyle="ghost" size="S" icon="mdi:refresh" :disabled="pending">
                        Refresh Topics
                    </MainButton>
                </div>
                
                <div v-if="pending && topics.length === 0" class="text-center text-label-secondary py-8">
                    <Icon icon="mdi:loading" class="animate-spin text-3xl mx-auto mb-2" />
                    <p>Loading active topics...</p>
                </div>

                <div v-else-if="topics.length === 0" class="text-center text-label-secondary py-8">
                    <Icon icon="mdi:sleep" class="text-3xl mx-auto mb-2 text-separator-primary" />
                    <p>No active topics detected yet.</p>
                </div>

                <div v-else class="space-y-4">
                    <div v-for="item in topics" :key="item.topic" class="bg-background-primary p-4 rounded-lg flex flex-col sm:flex-row gap-4 justify-between border border-separator-primary">
                        <div class="flex-1 min-w-0">
                            <h3 class="font-mono text-sm font-semibold text-accent-primary break-all mb-1">{{ item.topic }}</h3>
                            <div class="text-xs text-label-secondary flex items-center gap-4">
                                <span><Icon icon="mdi:email-outline" class="inline mr-1" />{{ item.messageCount }} msgs</span>
                                <span><Icon icon="mdi:clock-outline" class="inline mr-1" />{{ formatTime(item.lastMessageAt) }}</span>
                            </div>
                        </div>
                        <div class="sm:w-1/2 mt-2 sm:mt-0 bg-fill-tertiary p-2 rounded text-xs font-mono text-label-secondary break-all">
                            {{ item.lastPayloadPreview || '(Empty Payload)' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta, useFetch } from '#imports'
import { ref, onMounted, onUnmounted, reactive, watch } from 'vue'
import { Icon } from '@iconify/vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

// Live Topics Logic
const { data, pending, refresh } = await useFetch('/api/admin/mqtt/topics')

const topics = ref<Array<{
    topic: string
    messageCount: number
    lastMessageAt: string
    lastPayloadPreview: string
}>>([])

if (data.value && (data.value as any).topics) {
    topics.value = (data.value as any).topics
}

let interval: ReturnType<typeof setInterval>

async function refreshSelected() {
    await refresh()
    if (data.value && (data.value as any).topics) {
        topics.value = (data.value as any).topics
    }
}

onMounted(() => {
    interval = setInterval(async () => {
        await refreshSelected()
    }, 2000)
})

onUnmounted(() => {
    if (interval) clearInterval(interval)
})

function formatTime(dateStr: string) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleTimeString()
}

// Access Control Logic
const { data: usersData, pending: pendingUsers, refresh: refreshUsersData } = useFetch('/api/admin/mqtt/clients')

const usersList = ref<Array<any>>([])

watch(usersData, (newVal: any) => {
    if (newVal && newVal.users) {
        usersList.value = newVal.users
    }
}, { immediate: true })

async function refreshUsers() {
    await refreshUsersData()
}

const newUser = reactive({
    username: '',
    password: '',
    topic: ''
})

const creatingUser = ref(false)
const actionError = ref('')

async function submitCreateUser() {
    creatingUser.value = true
    actionError.value = ''
    try {
        const res = await $fetch('/api/admin/mqtt/clients/create', {
            method: 'POST',
            body: newUser
        })

        if (res.success) {
            newUser.username = ''
            newUser.password = ''
            newUser.topic = ''
            await refreshUsers()
        }
    } catch (e: any) {
        actionError.value = e.data?.message || e.message || 'Failed to create user'
    } finally {
        creatingUser.value = false
    }
}

async function deleteUser(username: string) {
    if (!confirm(`Are you sure you want to completely revoke access for device '${username}'?`)) return

    try {
        await $fetch('/api/admin/mqtt/clients/remove', {
            method: 'POST',
            body: { username }
        })
        await refreshUsers()
    } catch (e: any) {
        alert(e.data?.message || e.message || 'Failed to delete user')
    }
}

const addingTopicToUser = ref<string | null>(null)
const newTopic = ref('')

function startAddTopic(username: string) {
    addingTopicToUser.value = username
    newTopic.value = ''
}

async function submitAddTopic(username: string) {
    if (!newTopic.value.trim()) return
    
    try {
        const res = await $fetch('/api/admin/mqtt/clients/topic', {
            method: 'POST',
            body: { username, topic: newTopic.value.trim() }
        }) as any
        
        if (res.success) {
            addingTopicToUser.value = null
            newTopic.value = ''
            await refreshUsers()
        }
    } catch (e: any) {
        alert(e.data?.message || e.message || 'Failed to add topic')
    }
}

function deduplicateTopics(acls: any[]) {
    // DynSec might return duplicate topics with different acltypes (publish vs subscribe)
    const unique = new Set()
    const out: any[] = []
    for (const acl of acls) {
        if (!unique.has(acl.topic)) {
            unique.add(acl.topic)
            out.push(acl)
        }
    }
    return out
}
</script>

<style scoped>
.fade-in {
    animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
