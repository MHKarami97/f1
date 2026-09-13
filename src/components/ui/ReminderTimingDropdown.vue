<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { ReminderTiming } from '@/services/pushSubscriptionService'

const props = defineProps<{ modelValue: ReminderTiming[] }>()
const emit = defineEmits<{ 'update:modelValue': [ReminderTiming[]] }>()

interface TimingOption {
  value: ReminderTiming
  label: string
  hint: string
}

const OPTIONS: TimingOption[] = [
  { value: 'oneDayBefore', label: 'یک روز قبل', hint: '۲۴ ساعت مانده به مسابقه' },
  { value: 'oneHourBefore', label: 'یک ساعت قبل', hint: '۶۰ دقیقه مانده به مسابقه' },
  { value: 'atStart', label: 'لحظه‌ی شروع', hint: 'دقیقا زمان شروع' },
]

const isOpen = ref(false)
const rootEl = ref<HTMLElement | null>(null)

function isSelected(value: ReminderTiming): boolean {
  return props.modelValue.includes(value)
}

function toggleOption(value: ReminderTiming): void {
  const next = isSelected(value) ? props.modelValue.filter((v) => v !== value) : [...props.modelValue, value]
  emit('update:modelValue', next)
}

const summary = computed(() => {
  if (props.modelValue.length === 0) return 'انتخاب زمان یادآوری'
  if (props.modelValue.length === OPTIONS.length) return 'همه‌ی زمان‌ها'
  return OPTIONS.filter((o) => isSelected(o.value))
    .map((o) => o.label)
    .join('، ')
})

function onClickOutside(event: MouseEvent): void {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) isOpen.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <div ref="rootEl" class="relative inline-block text-right">
    <button
      type="button"
      class="flex items-center gap-2 rounded-xl border border-f1-light-border dark:border-f1-border bg-f1-light-surface dark:bg-f1-dark px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:border-f1-red hover:text-f1-red"
      @click="isOpen = !isOpen"
    >
      <span class="truncate max-w-[180px]">{{ summary }}</span>
      <svg
        class="w-4 h-4 flex-shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Transition name="dropdown-fade">
      <div
        v-if="isOpen"
        class="absolute z-20 mt-2 w-64 rounded-xl border border-f1-light-border dark:border-f1-border bg-f1-light-surface dark:bg-f1-surface shadow-2xl overflow-hidden"
      >
        <button
          v-for="option in OPTIONS"
          :key="option.value"
          type="button"
          class="flex w-full items-start gap-3 px-4 py-3 text-right transition-colors hover:bg-f1-red/5"
          @click="toggleOption(option.value)"
        >
          <span
            class="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors"
            :class="isSelected(option.value)
              ? 'border-f1-red bg-f1-red text-white'
              : 'border-f1-light-border dark:border-f1-border'"
          >
            <svg v-if="isSelected(option.value)" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span class="flex flex-col">
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ option.label }}</span>
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ option.hint }}</span>
          </span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>