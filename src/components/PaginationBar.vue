<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  page: number
  size: number
  total: number
  sizeOptions?: number[]
}>(), {
  sizeOptions: () => [10, 20, 50, 100],
})

const emit = defineEmits<{
  (event: 'update:page', value: number): void
  (event: 'update:size', value: number): void
}>()

const totalPages = computed(() => {
  if (!props.total)
    return 1
  return Math.max(1, Math.ceil(props.total / props.size))
})

const canPrev = computed(() => props.page > 1)
const canNext = computed(() => props.page < totalPages.value)

function clampPage(value: number) {
  return Math.min(totalPages.value, Math.max(1, value))
}

function setPage(value: number) {
  const next = clampPage(value)
  if (next !== props.page)
    emit('update:page', next)
}

function setSize(value: number) {
  if (value === props.size)
    return
  emit('update:size', value)
  emit('update:page', 1)
}
</script>

<template>
  <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <p class="text-xs text-neutral-500 uppercase tracking-[0.3em]">
      共 {{ total }} 条 · 第 {{ page }} / {{ totalPages }} 页
    </p>

    <div class="flex items-center gap-2">
      <select
        class="border border-neutral-900 rounded-md px-3 py-2 text-xs bg-white"
        :value="size"
        @change="setSize(Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="option in sizeOptions" :key="option" :value="option">
          {{ option }} / 页
        </option>
      </select>

      <button
        type="button"
        class="border border-neutral-900 rounded-md px-3 py-2 text-xs tracking-[0.3em] uppercase"
        :disabled="!canPrev"
        @click="setPage(page - 1)"
      >
        上一页
      </button>
      <button
        type="button"
        class="border border-neutral-900 rounded-md px-3 py-2 text-xs tracking-[0.3em] uppercase"
        :disabled="!canNext"
        @click="setPage(page + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>
