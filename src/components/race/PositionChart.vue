<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import type { RaceResult, Driver } from '@/types'

const props = defineProps<{ results: RaceResult[]; drivers: Driver[] }>()

const series = computed(() => [
  {
    name: 'پوزیشن پایانی',
    data: [...props.results]
      .sort((a, b) => a.position - b.position)
      .map((r) => {
        const driver = props.drivers.find((d) => d.driver_number === r.driver_number)
        return { x: driver?.name_acronym ?? String(r.driver_number), y: r.position }
      }),
  },
])

const options = computed<ApexOptions>(() => ({
  chart: { type: 'bar', background: 'transparent', foreColor: '#9CA3AF', toolbar: { show: false } },
  theme: { mode: 'dark' },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
  colors: ['#E10600'],
  dataLabels: { enabled: false },
  yaxis: { reversed: true, title: { text: 'پوزیشن' }, min: 1 },
  grid: { borderColor: '#2A2A38' },
  tooltip: { theme: 'dark' },
}))
</script>

<template>
  <div v-if="results.length > 0" class="card p-5">
    <h3 class="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-widest mb-4">پوزیشن پایانی رانندگان</h3>
    <VueApexCharts type="bar" :options="options" :series="series" height="300" />
  </div>
</template>