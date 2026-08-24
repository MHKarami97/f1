<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useConstructorStandings } from "@/composables";
import { useStandingsStore } from "@/stores";
import SkeletonLoader from "@/components/ui/SkeletonLoader.vue";
import ErrorBoundary from "@/components/ui/ErrorBoundary.vue";
import DriverAvatar from "@/components/ui/DriverAvatar.vue";

const route = useRoute();
const teamName = decodeURIComponent(route.params.name as string);

const { standings, isLoading, error, retry } = useConstructorStandings(true);

const standingsStore = useStandingsStore();
const { driverStandings } = storeToRefs(standingsStore);

const team = computed(
  () => standings.value.find((entry) => entry.team_name === teamName) ?? null,
);

const teamDrivers = computed(() =>
  driverStandings.value
    .filter((driver) => driver.team_name === teamName)
    .sort((a, b) => a.position - b.position),
);

function driverPath(driverNumber: number): string {
  return `/drivers/${driverNumber}`;
}
</script>

<template>
  <div class="space-y-6">
    <SkeletonLoader v-if="isLoading" :rows="5" height="h-16" />

    <ErrorBoundary
      v-else-if="error || !team"
      :message="error ?? 'تیم پیدا نشد'"
      :on-retry="retry"
    />

    <template v-else>
      <!-- Team header -->
      <section
        class="stripe-top relative overflow-hidden rounded-2xl border border-f1-light-border dark:border-f1-border p-6 md:p-8"
        :style="{
          background: `linear-gradient(135deg, #${team.team_colour}20, transparent 65%)`,
        }"
      >
        <div
          class="absolute -top-16 -left-16 h-64 w-64 rounded-full blur-3xl opacity-20"
          :style="{ backgroundColor: `#${team.team_colour}` }"
        />

        <div class="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div
            class="h-20 w-4 flex-shrink-0 rounded-full shadow-lg"
            :style="{
              backgroundColor: `#${team.team_colour}`,
              boxShadow: `0 0 28px #${team.team_colour}80`,
            }"
          />

          <div class="min-w-0">
            <p
              class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-f1-red"
            >
              تیم فرمول یک
            </p>
            <h1
              class="truncate text-3xl font-black text-gray-900 dark:text-white md:text-4xl"
            >
              {{ team.team_name }}
            </h1>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              رانندگان و آمار فصل جاری
            </p>
          </div>
        </div>
      </section>

      <!-- Team statistics -->
      <section class="grid grid-cols-3 gap-3 md:gap-4">
        <div class="card p-4 text-center md:p-5">
          <p class="mb-2 text-xs text-gray-400 dark:text-gray-500">رتبه</p>
          <p
            class="text-2xl font-black tabular-nums text-gray-900 dark:text-white md:text-3xl"
          >
            {{ team.position }}
          </p>
        </div>

        <div class="card p-4 text-center md:p-5">
          <p class="mb-2 text-xs text-gray-400 dark:text-gray-500">امتیاز</p>
          <p
            class="text-2xl font-black tabular-nums text-gray-900 dark:text-white md:text-3xl"
          >
            {{ team.points }}
          </p>
        </div>

        <div class="card p-4 text-center md:p-5">
          <p class="mb-2 text-xs text-gray-400 dark:text-gray-500">برد</p>
          <p
            class="text-2xl font-black tabular-nums text-gray-900 dark:text-white md:text-3xl"
          >
            {{ team.wins ?? '-' }}
          </p>
        </div>
      </section>

      <!-- Team drivers -->
      <section>
        <div class="mb-4 flex items-center justify-between">
          <h2
            class="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white"
          >
            <span class="h-5 w-1 rounded-full bg-f1-red" />
            رانندگان تیم
          </h2>

          <span
            class="rounded-full bg-f1-red/10 px-3 py-1 text-xs font-semibold text-f1-red"
          >
            {{ teamDrivers.length }} راننده
          </span>
        </div>

        <div
          v-if="teamDrivers.length > 0"
          class="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <RouterLink
            v-for="driver in teamDrivers"
            :key="driver.driver_number"
            :to="driverPath(driver.driver_number)"
            class="card-hover group flex items-center gap-4 p-4"
          >
            <div
              class="h-12 w-1 flex-shrink-0 rounded-full"
              :style="{
                backgroundColor: `#${driver.team_colour}`,
                boxShadow: `0 0 14px #${driver.team_colour}70`,
              }"
            />

            <DriverAvatar
              :src="driver.headshot_url"
              :name="driver.full_name"
              :team-colour="driver.team_colour"
              size-class="w-14 h-14"
              text-class="text-base"
            />

            <div class="min-w-0 flex-1">
              <p class="truncate font-bold text-gray-900 dark:text-white">
                {{ driver.full_name }}
              </p>

              <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {{ driver.name_acronym || `راننده #${driver.driver_number}` }}
              </p>
            </div>

            <div class="text-left">
              <p
                class="text-lg font-black tabular-nums text-gray-900 dark:text-white"
              >
                {{ driver.points }}
              </p>
              <p class="text-xs text-gray-400 dark:text-gray-500">امتیاز</p>
            </div>

            <svg
              class="h-5 w-5 flex-shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-f1-red dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 5l-7 7 7 7"
              />
            </svg>
          </RouterLink>
        </div>

        <div v-else class="card p-8 text-center">
          <div
            class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-f1-red/10"
          >
            <svg
              class="h-6 w-6 text-f1-red"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m8-8a4 4 0 100-8 4 4 0 000 8zm10 8v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
              />
            </svg>
          </div>

          <p class="text-sm text-gray-500 dark:text-gray-400">
            اطلاعات رانندگان این تیم در دسترس نیست.
          </p>
        </div>
      </section>
    </template>
  </div>
</template>
