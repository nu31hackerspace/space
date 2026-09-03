<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
        <h1 class="text-2xl font-bold text-accent-primary mb-6">Merch Admin</h1>

        <p
            v-if="loadError"
            class="text-red-500 mb-4"
        >
            {{ loadError }}
        </p>

        <div
            class="bg-fill-secondary border border-separator-primary rounded-xl p-4"
        >
            <h2 class="text-lg font-semibold text-accent-primary mb-4">
                Новий товар
            </h2>
            <form
                class="flex flex-col gap-3"
                enctype="multipart/form-data"
                @submit.prevent="createProduct"
            >
                <input
                    ref="fileInput"
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    required
                    :class="inputClass"
                    @change="handleFileSelect"
                />
                <p class="text-xs text-label-tertiary">
                    До {{ MAX_PRODUCT_IMAGES }} фото. Перше стає обкладинкою в
                    списку — порядок такий, як при виборі файлів.
                </p>
                <div
                    v-if="previewUrls.length"
                    class="flex gap-2 flex-wrap"
                >
                    <img
                        v-for="(url, index) in previewUrls"
                        :key="index"
                        :src="url"
                        :alt="`Фото ${index + 1}`"
                        class="w-20 h-20 object-cover rounded border border-separator-primary"
                    />
                </div>
                <input
                    v-model="form.name"
                    type="text"
                    placeholder="Назва (напр. Футболка NU31)"
                    required
                    :class="inputClass"
                />
                <textarea
                    v-model="form.description"
                    rows="2"
                    placeholder="Опис (необов'язково)"
                    :class="inputClass"
                />
                <input
                    v-model="form.price"
                    type="text"
                    inputmode="decimal"
                    placeholder="Ціна в гривнях, напр. 500 або 500.50"
                    required
                    :class="inputClass"
                />
                <MainButton
                    button-style="primary"
                    size="M"
                    :label="creating ? 'Зберігаємо…' : 'Додати товар'"
                />
            </form>
            <p
                v-if="createError"
                class="text-red-500 mt-2"
            >
                {{ createError }}
            </p>
        </div>

        <div
            class="mt-10 bg-fill-secondary border border-separator-primary rounded-xl p-4"
        >
            <h2 class="text-lg font-semibold text-accent-primary mb-3">
                Товари
            </h2>
            <div
                v-if="loading"
                class="text-label-secondary text-center py-8"
            >
                Завантаження…
            </div>
            <div
                v-else-if="products.length === 0"
                class="text-label-secondary text-center py-8"
            >
                Товарів ще немає.
            </div>
            <div
                v-else
                class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
                <div
                    v-for="product in products"
                    :key="product.id"
                    class="flex flex-col gap-2"
                >
                    <div
                        class="aspect-square rounded overflow-hidden bg-fill-tertiary border border-separator-primary"
                        :class="{ 'opacity-40': !product.isAvailable }"
                    >
                        <img
                            v-if="product.imageFilenames.length"
                            :src="`/api/merch/products/image/${product.imageFilenames[0]}`"
                            :alt="product.name"
                            class="w-full h-full object-cover"
                        />
                    </div>
                    <div class="text-sm font-bold text-label-primary">
                        {{ product.name }}
                    </div>
                    <div class="text-sm text-label-secondary">
                        {{ formatPrice(product.priceKopecks) }}
                        <span v-if="product.imageFilenames.length > 1">
                            · {{ product.imageFilenames.length }} фото
                        </span>
                    </div>
                    <div class="flex gap-2">
                        <MainButton
                            button-style="secondary"
                            size="S"
                            :label="
                                product.isAvailable ? 'В наявності' : 'Немає'
                            "
                            @click="toggleAvailability(product)"
                        />
                        <MainButton
                            button-style="danger"
                            size="S"
                            label="Видалити"
                            @click="deleteProduct(product.slug)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div
            class="mt-10 bg-fill-secondary border border-separator-primary rounded-xl p-4"
        >
            <h2 class="text-lg font-semibold text-accent-primary mb-3">
                Замовлення
            </h2>
            <div
                v-if="loading"
                class="text-label-secondary text-center py-8"
            >
                Завантаження…
            </div>
            <div
                v-else-if="orders.length === 0"
                class="text-label-secondary text-center py-8"
            >
                Замовлень ще немає.
            </div>
            <div
                v-else
                class="overflow-x-auto"
            >
                <table class="w-full text-sm text-left">
                    <thead
                        class="text-label-secondary border-b border-separator-primary"
                    >
                        <tr>
                            <th class="py-2 pr-4 font-semibold">Дата</th>
                            <th class="py-2 pr-4 font-semibold">Товар</th>
                            <th class="py-2 pr-4 font-semibold">Покупець</th>
                            <th class="py-2 pr-4 font-semibold">Доставка</th>
                            <th class="py-2 pr-4 font-semibold">Сума</th>
                            <th class="py-2 font-semibold">Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="order in orders"
                            :key="order.id"
                            class="border-b border-separator-secondary align-top"
                        >
                            <td class="py-3 pr-4 whitespace-nowrap">
                                {{ new Date(order.createdAt).toLocaleString() }}
                            </td>
                            <td class="py-3 pr-4">
                                <div
                                    v-for="item in order.items"
                                    :key="item.productId"
                                >
                                    {{ item.name }} × {{ item.quantity }}
                                </div>
                            </td>
                            <td class="py-3 pr-4">
                                <div>{{ order.customer.name }}</div>
                                <div class="text-label-secondary">
                                    {{ order.customer.email }}
                                </div>
                                <div class="text-label-secondary">
                                    {{ order.customer.phone }}
                                </div>
                            </td>
                            <td class="py-3 pr-4 max-w-xs">
                                <div>
                                    {{ order.customer.delivery.cityName }}
                                </div>
                                <div class="text-label-secondary">
                                    {{ order.customer.delivery.warehouseName }}
                                </div>
                            </td>
                            <td class="py-3 pr-4 whitespace-nowrap">
                                {{ formatPrice(order.totalKopecks) }}
                            </td>
                            <td class="py-3">
                                <MainBadge
                                    :variant="statusVariant(order.status)"
                                    :label="statusLabel(order.status)"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { onMounted, ref } from 'vue'
import {
    MAX_PRODUCT_IMAGES,
    type MerchOrder,
    type MerchOrderStatus,
    type MerchProduct,
} from '~~/shared/types/merch'
import { formatPrice } from '~~/shared/merch'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const inputClass =
    'w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary'

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const previewUrls = ref<string[]>([])
const creating = ref(false)
const createError = ref('')
const form = ref({ name: '', description: '', price: '' })

const products = ref<MerchProduct[]>([])
const orders = ref<MerchOrder[]>([])
const loading = ref(true)
const loadError = ref('')

function handleFileSelect(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files || [])
    if (files.length === 0) {
        return
    }

    if (files.length > MAX_PRODUCT_IMAGES) {
        createError.value = `Максимум ${MAX_PRODUCT_IMAGES} фото`
        return
    }

    createError.value = ''
    selectedFiles.value = files
    // Previews are built in order and rendered by index, so the strip always
    // shows the same sequence the gallery will use.
    previewUrls.value = []
    files.forEach((file, index) => {
        const reader = new FileReader()
        reader.onload = (loaded) => {
            previewUrls.value[index] = loaded.target?.result as string
        }
        reader.readAsDataURL(file)
    })
}

async function createProduct() {
    if (selectedFiles.value.length === 0) {
        createError.value = 'Додай хоча б одне зображення товару'
        return
    }

    creating.value = true
    createError.value = ''

    try {
        const formData = new FormData()
        for (const file of selectedFiles.value) {
            formData.append('images', file)
        }
        formData.append('name', form.value.name)
        formData.append('description', form.value.description)
        formData.append('price', form.value.price)

        // fetch, not $fetch: FormData needs the browser to set the multipart
        // boundary itself, matching how the gallery admin uploads.
        const response = await fetch('/api/merch/products', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        })

        if (!response.ok) {
            const body = await response.json()
            throw new Error(body.statusMessage || 'Не вдалося додати товар')
        }

        form.value = { name: '', description: '', price: '' }
        selectedFiles.value = []
        previewUrls.value = []
        if (fileInput.value) {
            fileInput.value.value = ''
        }
        await refreshProducts()
    } catch (error: unknown) {
        createError.value =
            (error as Error)?.message || 'Не вдалося додати товар'
    } finally {
        creating.value = false
    }
}

async function toggleAvailability(product: MerchProduct) {
    try {
        await $fetch(`/api/merch/products/${product.slug}`, {
            method: 'PATCH',
            credentials: 'include',
            body: { isAvailable: !product.isAvailable },
        })
        await refreshProducts()
    } catch (error: unknown) {
        alert(
            (error as { statusMessage?: string })?.statusMessage ||
                'Не вдалося змінити наявність'
        )
    }
}

async function deleteProduct(slug: string) {
    if (!confirm('Видалити товар?')) {
        return
    }

    try {
        await $fetch(`/api/merch/products/${slug}`, {
            method: 'DELETE',
            credentials: 'include',
        })
        await refreshProducts()
    } catch (error: unknown) {
        alert(
            (error as { statusMessage?: string })?.statusMessage ||
                'Не вдалося видалити товар'
        )
    }
}

function statusLabel(status: MerchOrderStatus): string {
    switch (status) {
        case 'paid':
            return 'Оплачено'
        case 'processing':
            return 'Обробка'
        case 'failed':
            return 'Не оплачено'
        case 'expired':
            return 'Протерміновано'
        case 'reversed':
            return 'Повернено'
        default:
            return 'Створено'
    }
}

function statusVariant(status: MerchOrderStatus): 'info' | 'success' | 'error' {
    if (status === 'paid') {
        return 'success'
    }
    if (['failed', 'expired', 'reversed'].includes(status)) {
        return 'error'
    }
    return 'info'
}

async function refreshProducts() {
    products.value =
        (await $fetch<MerchProduct[]>('/api/merch/products?all=true', {
            credentials: 'include',
        })) || []
}

async function refreshOrders() {
    orders.value =
        (await $fetch<MerchOrder[]>('/api/merch/orders', {
            credentials: 'include',
        })) || []
}

// Loaded on the client, never during SSR. A server-side $fetch carries no
// browser cookie, so the authenticated orders call would 401 and take the whole
// page render down with it — which is exactly what happened on a hard reload.
onMounted(async () => {
    try {
        await Promise.all([refreshProducts(), refreshOrders()])
    } catch (error: unknown) {
        loadError.value =
            (error as { statusMessage?: string })?.statusMessage ||
            'Не вдалося завантажити дані'
    } finally {
        loading.value = false
    }
})
</script>
