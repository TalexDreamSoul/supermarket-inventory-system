<script setup lang="ts">
import { useDashboard } from '~/composables/useDashboard'
import { useVersionFlag } from '~/composables/useVersionFlag'

defineOptions({
  name: 'DashboardHome',
})

const { stats, products, alerts, schedule, loading, errorMessage, refresh } = useDashboard()
const { isLaiShenVersion } = useVersionFlag()
</script>

<template>
  <section class="h-full min-h-0 flex flex-col gap-4 text-left">
    <header class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-semibold tracking-wide">
          仪表盘 · 库存状态
        </h1>
      </div>
      <button
        class="border border-neutral-900 rounded-md px-4 py-2 text-xs tracking-[0.3em] uppercase"
        type="button"
        :disabled="loading"
        @click="refresh"
      >
        {{ loading ? '同步中' : '刷新数据' }}
      </button>
    </header>

    <p v-if="errorMessage" class="text-sm text-red-500 border border-red-200 rounded px-3 py-2 bg-red-50">
      {{ errorMessage }}
    </p>

    <p v-else-if="loading" class="text-sm text-neutral-500">
      数据加载中...
    </p>

    <div class="flex-1 min-h-0 overflow-auto space-y-6">
      <template v-if="isLaiShenVersion">
        <section v-if="stats.length" class="grid gap-4 md:grid-cols-3">
          <article
            v-for="stat in stats"
            :key="stat.title"
            class="bg-white border border-neutral-200 rounded-xl px-5 py-6"
          >
            <p class="text-xs uppercase tracking-[0.3em] text-neutral-400">
              {{ stat.title }}
            </p>
            <p class="text-3xl font-semibold mt-3">
              {{ stat.value }}
            </p>
            <p class="text-sm text-neutral-500 mt-1">
              {{ stat.meta }}
            </p>
          </article>
        </section>

        <section v-if="products.length || alerts.length" class="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <article class="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 overflow-hidden flex flex-col min-h-0">
            <header class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold">
                  库存关注列表
                </h2>
              </div>
            </header>
            <div class="overflow-auto flex-1 min-h-0">
              <table class="w-full text-sm">
                <thead class="sticky top-0 bg-white">
                  <tr class="text-left text-xs uppercase tracking-[0.3em] text-neutral-400">
                    <th class="py-2">
                      编码
                    </th>
                    <th>
                      名称
                    </th>
                    <th>
                      库存
                    </th>
                    <th>
                      最小库存
                    </th>
                    <th>
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody class="text-neutral-700">
                  <tr v-for="item in products" :key="item.code" class="border-t border-neutral-100">
                    <td class="py-3 font-mono tracking-[0.2em]">
                      {{ item.code }}
                    </td>
                    <td>
                      {{ item.name }}
                    </td>
                    <td>
                      {{ item.stock }}
                    </td>
                    <td class="font-mono tracking-[0.2em]">
                      {{ item.min }}
                    </td>
                    <td class="text-neutral-500 capitalize">
                      {{ item.status }}
                    </td>
                  </tr>
                  <tr v-if="!products.length">
                    <td colspan="5" class="py-4 text-center text-neutral-400">
                      暂无商品数据
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="bg-white border border-neutral-200 rounded-xl p-5 space-y-6 overflow-hidden flex flex-col min-h-0">
            <header>
              <h2 class="text-xl font-semibold">
                库存预警 / 日程
              </h2>
            </header>
            <div class="grid gap-3">
              <div
                v-for="alert in alerts"
                :key="alert.label"
                class="flex items-center justify-between rounded-lg px-4 py-3 border border-dashed border-neutral-300"
                :class="alert.emphasis ? 'bg-neutral-100' : 'bg-white'"
              >
                <p class="text-sm text-neutral-500">
                  {{ alert.label }}
                </p>
                <p class="text-2xl font-semibold text-neutral-900">
                  {{ alert.value }}
                </p>
              </div>
            </div>
            <ul class="space-y-3 border-t border-neutral-100 pt-4 text-sm overflow-auto flex-1 min-h-0">
              <li v-for="node in schedule" :key="node.time + node.label" class="flex gap-3">
                <div class="w-12 text-neutral-500 tracking-[0.3em]">
                  {{ node.time }}
                </div>
                <div>
                  <p class="font-medium">
                    {{ node.label }}
                  </p>
                  <p class="text-neutral-500">
                    {{ node.detail }}
                  </p>
                </div>
              </li>
              <li v-if="!schedule.length" class="text-neutral-400">
                暂无操作记录
              </li>
            </ul>
          </article>
        </section>
      </template>

      <template v-else>
        <section v-if="stats.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="stat in stats"
            :key="stat.title"
            class="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col gap-2"
          >
            <p class="text-xs uppercase tracking-[0.35em] text-neutral-400">
              {{ stat.title }}
            </p>
            <p class="text-4xl font-semibold text-neutral-900">
              {{ stat.value }}
            </p>
            <p class="text-sm text-neutral-500">
              {{ stat.meta }}
            </p>
          </article>
        </section>

        <section class="grid gap-6 lg:grid-cols-[3fr,2fr]">
          <article class="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col shadow-sm min-h-[360px]">
            <header class="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-neutral-400">
                  商品列表
                </p>
                <h2 class="text-2xl font-semibold">
                  库存观测
                </h2>
              </div>
              <p class="text-xs text-neutral-500">
                共 {{ products.length }} 条
              </p>
            </header>
            <div class="overflow-auto flex-1 min-h-0">
              <table class="w-full text-sm">
                <thead class="text-left text-xs uppercase tracking-[0.3em] text-neutral-400">
                  <tr>
                    <th class="py-2">
                      编码
                    </th>
                    <th>
                      名称
                    </th>
                    <th class="text-right">
                      库存
                    </th>
                    <th class="text-right">
                      最小
                    </th>
                    <th>
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody class="text-neutral-800">
                  <tr v-for="item in products" :key="item.code" class="border-t border-neutral-100">
                    <td class="py-3 font-mono tracking-[0.25em] text-neutral-500">
                      {{ item.code }}
                    </td>
                    <td class="py-3">
                      {{ item.name }}
                    </td>
                    <td class="py-3 text-right font-semibold">
                      {{ item.stock }}
                    </td>
                    <td class="py-3 text-right text-neutral-500">
                      {{ item.min }}
                    </td>
                    <td class="py-3">
                      <span
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold tracking-wide"
                        :class="item.status === 'out_of_stock'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : 'bg-neutral-100 text-neutral-600 border border-neutral-200'"
                      >
                        {{ item.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!products.length">
                    <td colspan="5" class="py-6 text-center text-neutral-400">
                      暂无数据
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <header>
              <p class="text-xs uppercase tracking-[0.3em] text-neutral-400">
                库存预警
              </p>
              <h2 class="text-2xl font-semibold">
                告警数据
              </h2>
            </header>
            <div class="grid gap-3">
              <div
                v-for="alert in alerts"
                :key="alert.label"
                class="flex items-center justify-between border border-neutral-100 rounded-xl px-4 py-3 bg-neutral-50"
              >
                <p class="text-sm text-neutral-500">
                  {{ alert.label }}
                </p>
                <p class="text-3xl font-semibold text-neutral-900">
                  {{ alert.value }}
                </p>
              </div>
              <p v-if="!alerts.length" class="text-sm text-neutral-400 border border-neutral-100 rounded-xl px-4 py-3">
                暂无告警
              </p>
            </div>
          </article>
        </section>

        <section class="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <header class="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-neutral-400">
                今日操作
              </p>
              <h2 class="text-2xl font-semibold">
                时间线
              </h2>
            </div>
          </header>
          <ul class="divide-y divide-neutral-100">
            <li v-for="node in schedule" :key="node.time + node.label" class="py-4 flex gap-4">
              <div class="text-xs uppercase tracking-[0.3em] text-neutral-400 w-20">
                {{ node.time }}
              </div>
              <div>
                <p class="font-semibold">
                  {{ node.label }}
                </p>
                <p class="text-sm text-neutral-500">
                  {{ node.detail }}
                </p>
              </div>
            </li>
            <li v-if="!schedule.length" class="py-6 text-center text-neutral-400">
              暂无操作记录
            </li>
          </ul>
        </section>
      </template>
    </div>
  </section>
</template>
