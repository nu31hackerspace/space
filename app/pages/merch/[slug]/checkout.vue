<template>
    <div class="min-h-screen text-label-primary">
        <div class="container mx-auto px-4 py-8 max-w-lg">
            <NuxtLink
                :to="`/merch/${route.params.slug}`"
                class="text-sm text-label-secondary hover:text-accent-primary transition-colors mb-6 inline-block"
            >
                ← Назад до товару
            </NuxtLink>

            <div
                v-if="pending"
                class="text-label-secondary py-12 text-center"
            >
                Завантаження…
            </div>

            <div
                v-else-if="!product"
                class="text-label-secondary py-12 text-center"
            >
                Такого товару немає.
            </div>

            <div
                v-else
                class="bg-background-primary border border-separator-primary rounded-xl p-6"
            >
                <div class="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 class="text-xl font-bold text-accent-primary">
                            {{ product.name }}
                        </h1>
                        <p class="text-label-secondary text-sm mt-1">
                            {{ formatPrice(product.priceKopecks) }} ×
                            {{ quantity }} = {{ formatPrice(totalKopecks) }}
                        </p>
                    </div>
                    <div
                        v-if="
                            product.imageFilenames &&
                            product.imageFilenames.length > 0
                        "
                        class="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-fill-tertiary border border-separator-primary"
                    >
                        <img
                            :src="`/api/merch/products/image/${product.imageFilenames[0]}`"
                            :alt="product.name"
                            class="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                </div>

                <form
                    class="flex flex-col gap-4"
                    @submit.prevent="submitOrder"
                >
                    <label class="flex flex-col gap-2">
                        <span class="text-sm text-label-secondary">
                            Кількість
                        </span>
                        <input
                            v-model.number="quantity"
                            type="number"
                            min="1"
                            max="50"
                            required
                            :class="inputClass"
                        />
                    </label>

                    <label class="flex flex-col gap-2">
                        <span class="text-sm text-label-secondary">
                            Ім'я та прізвище
                        </span>
                        <input
                            v-model="customer.name"
                            type="text"
                            required
                            :class="inputClass"
                        />
                    </label>

                    <label class="flex flex-col gap-2">
                        <span class="text-sm text-label-secondary">Email</span>
                        <input
                            v-model="customer.email"
                            type="email"
                            required
                            :class="inputClass"
                        />
                    </label>

                    <label class="flex flex-col gap-2">
                        <span class="text-sm text-label-secondary">
                            Телефон
                        </span>
                        <input
                            v-model="customer.phone"
                            type="tel"
                            placeholder="+380..."
                            required
                            :class="inputClass"
                        />
                    </label>

                    <div class="flex flex-col gap-2">
                        <span class="text-sm text-label-secondary">
                            Місто доставки (Нова Пошта)
                        </span>
                        <input
                            v-model="cityQuery"
                            type="text"
                            placeholder="Почни вводити назву міста"
                            :class="inputClass"
                            @input="onCityInput"
                        />
                        <p
                            v-if="cityLoading"
                            class="text-xs text-label-tertiary"
                        >
                            Шукаємо…
                        </p>
                        <ul
                            v-if="cities.length > 0 && !chosenCity"
                            class="border border-separator-primary rounded max-h-48 overflow-y-auto"
                        >
                            <li
                                v-for="city in cities"
                                :key="city.ref"
                            >
                                <button
                                    type="button"
                                    class="w-full text-left px-3 py-2 hover:bg-fill-tertiary text-sm"
                                    @click="chooseCity(city)"
                                >
                                    {{ city.name }}
                                    <span class="text-label-tertiary">
                                        {{ city.area }}
                                    </span>
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div
                        v-if="chosenCity"
                        class="flex flex-col gap-2"
                    >
                        <span class="text-sm text-label-secondary">
                            Відділення
                        </span>
                        <input
                            v-model="warehouseQuery"
                            type="text"
                            placeholder="Номер відділення або вулиця"
                            :class="inputClass"
                            @input="onWarehouseInput"
                        />
                        <p
                            v-if="warehousesLoading"
                            class="text-xs text-label-tertiary"
                        >
                            Завантажуємо відділення…
                        </p>
                        <p
                            v-else-if="chosenWarehouse"
                            class="text-sm text-label-primary"
                        >
                            Обрано: {{ chosenWarehouse.name }}
                        </p>
                        <ul
                            v-if="warehouses.length > 0 && !chosenWarehouse"
                            class="border border-separator-primary rounded max-h-48 overflow-y-auto"
                        >
                            <li
                                v-for="warehouse in warehouses"
                                :key="warehouse.ref"
                            >
                                <button
                                    type="button"
                                    class="w-full text-left px-3 py-2 hover:bg-fill-tertiary text-sm"
                                    @click="chooseWarehouse(warehouse)"
                                >
                                    {{ warehouse.name }}
                                </button>
                            </li>
                        </ul>
                    </div>

                    <p
                        v-if="submitError"
                        class="text-red-500 text-sm"
                    >
                        {{ submitError }}
                    </p>

                    <MainButton
                        button-style="primary"
                        size="L"
                        :label="
                            submitting
                                ? 'Створюємо рахунок…'
                                : `Оплатити ${formatPrice(totalKopecks)}`
                        "
                    />

                    <p class="text-xs text-label-tertiary text-center">
                        Далі відкриється захищена сторінка оплати monobank.
                    </p>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { definePageMeta, useFetch, useRoute } from '#imports'
import type {
    CreateMerchOrderResponse,
    MerchProduct,
} from '~~/shared/types/merch'
import type { DeliveryCity, DeliveryWarehouse } from '~~/shared/types/delivery'
import { formatPrice } from '~~/shared/merch'

definePageMeta({ layout: 'default' })

const route = useRoute()

const { data, pending } = await useFetch<MerchProduct>(
    () => `/api/merch/products/${route.params.slug}`
)

const product = computed(() => data.value || null)

const inputClass =
    'w-full p-2 rounded bg-transparent border border-separator-primary text-label-primary'

const quantity = ref(1)
const submitting = ref(false)
const submitError = ref('')
const customer = ref({ name: '', email: '', phone: '' })

// Nova Poshta pickers. Only the refs are ever submitted — the server resolves
// the city and branch names itself.
const cityQuery = ref('')
const cities = ref<DeliveryCity[]>([])
const chosenCity = ref<DeliveryCity | null>(null)
const cityLoading = ref(false)
const warehouses = ref<DeliveryWarehouse[]>([])
const chosenWarehouse = ref<DeliveryWarehouse | null>(null)
const warehouseQuery = ref('')
const warehousesLoading = ref(false)
let citySearchTimer: ReturnType<typeof setTimeout> | null = null
let warehouseSearchTimer: ReturnType<typeof setTimeout> | null = null

// Debounced so a typed city name costs one request, not one per keystroke.
function onCityInput() {
    chosenCity.value = null
    warehouses.value = []
    chosenWarehouse.value = null
    warehouseQuery.value = ''

    if (citySearchTimer) {
        clearTimeout(citySearchTimer)
    }

    const query = cityQuery.value.trim()
    if (query.length < 2) {
        cities.value = []
        return
    }

    citySearchTimer = setTimeout(async () => {
        cityLoading.value = true
        try {
            cities.value = await $fetch<DeliveryCity[]>(
                '/api/delivery/cities',
                { query: { q: query } }
            )
        } catch {
            cities.value = []
        } finally {
            cityLoading.value = false
        }
    }, 300)
}

async function loadWarehouses() {
    if (!chosenCity.value) {
        return
    }

    warehousesLoading.value = true
    try {
        // The server searches and pages the list: a city like Kyiv has
        // thousands of branches, and shipping them all would be 1.5 MB.
        warehouses.value = await $fetch<DeliveryWarehouse[]>(
            '/api/delivery/warehouses',
            {
                query: {
                    cityRef: chosenCity.value.ref,
                    q: warehouseQuery.value.trim(),
                },
            }
        )
    } catch {
        warehouses.value = []
        submitError.value = 'Не вдалося завантажити відділення'
    } finally {
        warehousesLoading.value = false
    }
}

async function chooseCity(city: DeliveryCity) {
    chosenCity.value = city
    cityQuery.value = city.name
    cities.value = []
    chosenWarehouse.value = null
    warehouseQuery.value = ''
    await loadWarehouses()
}

function onWarehouseInput() {
    chosenWarehouse.value = null

    if (warehouseSearchTimer) {
        clearTimeout(warehouseSearchTimer)
    }
    warehouseSearchTimer = setTimeout(loadWarehouses, 300)
}

function chooseWarehouse(warehouse: DeliveryWarehouse) {
    chosenWarehouse.value = warehouse
    warehouseQuery.value = warehouse.name
    warehouses.value = []
}

const totalKopecks = computed(
    () => (product.value?.priceKopecks || 0) * Math.max(1, quantity.value || 1)
)

const canSubmit = computed(
    () => Boolean(chosenCity.value) && Boolean(chosenWarehouse.value)
)

async function submitOrder() {
    if (submitting.value || !product.value) {
        return
    }

    if (!canSubmit.value) {
        submitError.value = 'Обери місто та відділення Нової Пошти'
        return
    }

    submitting.value = true
    submitError.value = ''

    try {
        const response = await $fetch<CreateMerchOrderResponse>(
            '/api/merch/orders',
            {
                method: 'POST',
                credentials: 'include',
                body: {
                    productId: product.value.id,
                    quantity: quantity.value,
                    customer: {
                        ...customer.value,
                        cityRef: chosenCity.value?.ref || '',
                        warehouseRef: chosenWarehouse.value?.ref || '',
                    },
                },
            }
        )

        // Full page navigation, not navigateTo — the payment page is monobank's.
        window.location.href = response.pageUrl
    } catch (error: unknown) {
        const message = (error as { statusMessage?: string })?.statusMessage
        submitError.value = message || 'Не вдалося створити рахунок'
        submitting.value = false
    }
}
</script>
