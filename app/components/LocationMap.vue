<template>
    <ClientOnly>
        <div class="w-full h-[500px] rounded-xl overflow-hidden border border-separator-primary">
            <l-map
                :zoom="16"
                :center="[50.46628015850258, 30.49987725222005]"
                :use-global-leaflet="false"
                class="w-full h-full"
            >
                <l-tile-layer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    layer-type="base"
                    name="OpenStreetMap"
                />
                <l-marker :lat-lng="[50.46628015850258, 30.49987725222005]">
                    <l-popup>
                        <div class="text-center">
                            <p class="font-semibold">NU31 Hacker Space</p>
                            <p class="text-sm text-gray-600">
                                вул. Нижньоюрківська, 31, Київ
                            </p>
                        </div>
                    </l-popup>
                </l-marker>
            </l-map>
        </div>
        <template #fallback>
            <div class="w-full h-[500px] rounded-xl overflow-hidden border border-separator-primary bg-fill-secondary flex items-center justify-center">
                <p class="text-label-secondary">Завантаження карти...</p>
            </div>
        </template>
    </ClientOnly>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon issue in Leaflet with bundlers
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

onMounted(() => {
    L.Marker.prototype.options.icon = DefaultIcon
})
</script>

