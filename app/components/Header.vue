<template>
    <div class="container mx-auto px-4 py-4">
        <div class="flex justify-end space-x-4">
            <MainButton buttonStyle="primary" size="M" icon="ic:baseline-discord" label="Вхід для резедентів" @click="startLoginFlow" />
            <ThemeSwitch />
        </div>
    </div>
</template>

<script setup>
function startLoginFlow() {
    console.log('startLoginFlow')
}
</script>
