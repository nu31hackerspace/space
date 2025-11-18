<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <h1 class="text-2xl font-bold text-accent-primary mb-6">Gallery Admin</h1>

        <div class="grid grid-cols-1 gap-8">
            <div class="bg-fill-secondary border border-separator-primary rounded-xl p-4">
                <h2 class="text-lg font-semibold text-accent-primary mb-4">Upload new image</h2>
                <form class="flex flex-col gap-3" @submit.prevent="uploadImage" enctype="multipart/form-data">
                    <input ref="fileInput" type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        @change="handleFileSelect"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary"
                        required />
                    <div v-if="previewUrl" class="w-full">
                        <img :src="previewUrl" alt="Preview"
                            class="max-w-full max-h-64 rounded border border-separator-primary" />
                    </div>
                    <input v-model="altText" type="text" placeholder="Alt text (optional)"
                        class="w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary" />
                    <MainButton button-style="primary" size="M" :label="uploading ? 'Uploading…' : 'Upload'" />
                </form>
                <p v-if="uploadError" class="text-red-500 mt-2">{{ uploadError }}</p>
                <p v-if="uploadOk" class="text-green-600 mt-2">Uploaded successfully</p>
            </div>
        </div>

        <div class="mt-10 bg-fill-secondary border border-separator-primary rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
                <h2 class="text-lg font-semibold text-accent-primary">Gallery Images</h2>
            </div>
            <div v-if="listPending">Loading…</div>
            <div v-else-if="items.length === 0" class="text-label-secondary text-center py-8">
                No gallery images yet. Upload one above to get started.
            </div>
            <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div v-for="item in items" :key="item.id" class="relative group">
                    <div class="aspect-square rounded overflow-hidden bg-fill-tertiary border border-separator-primary">
                        <img :src="`/api/gallery/image/${item.imageFilename}`" :alt="item.altText || 'Gallery image'"
                            class="w-full h-full object-cover" />
                    </div>
                    <div class="mt-2 text-xs text-label-secondary truncate" v-if="item.altText">
                        {{ item.altText }}
                    </div>
                    <div class="mt-1 text-xs text-label-secondary">
                        {{ new Date(item.createdAt).toLocaleDateString() }}
                    </div>
                    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MainButton button-style="ghost" size="S" label="Delete" @click="deleteImage(item.id)" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { ref } from 'vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const altText = ref('')
const uploading = ref(false)
const uploadError = ref('')
const uploadOk = ref(false)

function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        selectedFile.value = file
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            previewUrl.value = e.target?.result as string
        }
        reader.readAsDataURL(file)
    }
}

async function uploadImage() {
    if (!selectedFile.value) {
        uploadError.value = 'Please select an image file'
        return
    }

    uploading.value = true
    uploadError.value = ''
    uploadOk.value = false

    try {
        const formData = new FormData()
        formData.append('image', selectedFile.value)
        if (altText.value.trim()) {
            formData.append('altText', altText.value.trim())
        }

        const response = await fetch('/api/gallery', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.statusMessage || 'Failed to upload image')
        }

        uploadOk.value = true
        selectedFile.value = null
        previewUrl.value = null
        altText.value = ''
        if (fileInput.value) {
            fileInput.value.value = ''
        }
        await refreshList()
        setTimeout(() => {
            uploadOk.value = false
        }, 3000)
    } catch (e: any) {
        uploadError.value = e?.message || 'Failed to upload image'
    } finally {
        uploading.value = false
    }
}

const items = ref<
    Array<{
        id: string
        imageFilename: string
        altText: string
        createdAt: string
    }>
>([])
const listPending = ref(false)
const deleting = ref<string | null>(null)

async function refreshList() {
    listPending.value = true
    try {
        const data = await $fetch('/api/gallery')
        items.value = data || []
    } catch (error) {
        console.error('Failed to refresh gallery list:', error)
    } finally {
        listPending.value = false
    }
}

async function deleteImage(id: string) {
    if (!confirm('Are you sure you want to delete this image?')) {
        return
    }

    deleting.value = id
    try {
        const response = await fetch(`/api/gallery/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.statusMessage || 'Failed to delete image')
        }

        await refreshList()
    } catch (e: any) {
        alert(e?.message || e?.statusMessage || 'Failed to delete image')
    } finally {
        deleting.value = null
    }
}

await refreshList()
</script>
