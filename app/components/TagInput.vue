<template>
    <div class="relative" ref="wrapper">
        <div
            class="flex flex-wrap items-center gap-1.5 p-2 rounded border border-separator-primary cursor-text min-h-[2.5rem]"
            @click="focusInput"
        >
            <span
                v-for="(tag, index) in modelValue"
                :key="tag"
                class="rounded-full bg-fill-secondary border border-separator-primary px-2 py-0.5 text-xs text-label-secondary flex items-center gap-1 shrink-0"
            >
                {{ tag }}
                <button
                    type="button"
                    class="text-label-tertiary hover:text-accent-primary leading-none"
                    @click.stop="removeTag(index)"
                >×</button>
            </span>
            <input
                ref="inputEl"
                v-model="inputValue"
                class="flex-1 min-w-[8rem] bg-transparent outline-none text-sm text-label-primary placeholder:text-label-tertiary"
                placeholder="Додати тег…"
                @focus="open = true"
                @blur="onBlur"
                @keydown="onKeydown"
            />
        </div>

        <div v-if="open && visibleSuggestions.length" class="flex mt-1">
            <div class="max-h-48 overflow-y-auto bg-fill-secondary border border-separator-primary rounded-lg">
                <button
                    v-for="tag in visibleSuggestions"
                    :key="tag"
                    type="button"
                    class="block whitespace-nowrap text-left px-6 py-2 text-xs uppercase tracking-[0.15em] text-label-secondary hover:bg-accent-primary/10 hover:text-accent-primary transition-colors"
                    @mousedown.prevent="addTag(tag)"
                >
                    {{ tag }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
    modelValue: string[]
    suggestions: string[]
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string[]]
}>()

const inputEl = ref<HTMLInputElement | null>(null)
const inputValue = ref('')
const open = ref(false)

const visibleSuggestions = computed(() =>
    props.suggestions.filter(s => !props.modelValue.includes(s))
)

function focusInput() {
    inputEl.value?.focus()
}

function addTag(tag: string) {
    const trimmed = tag.trim()
    if (!trimmed || props.modelValue.includes(trimmed)) return
    emit('update:modelValue', [...props.modelValue, trimmed])
    inputValue.value = ''
}

function removeTag(index: number) {
    const next = [...props.modelValue]
    next.splice(index, 1)
    emit('update:modelValue', next)
}

function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault()
        addTag(inputValue.value)
    } else if (e.key === 'Backspace' && inputValue.value === '') {
        removeTag(props.modelValue.length - 1)
    } else if (e.key === 'Escape') {
        open.value = false
    }
}

function onBlur() {
    setTimeout(() => { open.value = false }, 150)
}
</script>
