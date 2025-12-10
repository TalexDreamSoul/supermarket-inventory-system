<script setup lang="ts">
import { useDashboard } from '~/composables/useDashboard'

defineOptions({
  name: 'DashboardHome',
})

const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
const { stats, products, alerts, schedule, loading, errorMessage, refresh } = useDashboard()
</script>

<template>
  <section class="space-y-10 text-left">
    <header class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div class="space-y-1">
        <h1 class="text-3xl font-semibold tracking-wide">
          仪表盘 · 库存状态
        </h1>
        <p class="text-sm text-neutral-500">
          接口：<code>{{ backendBaseUrl || '未配置' }}</code> · 数据来自 API 定义
        </p>
        <p class="text-neutral-600">
          真实 CMS 风格，只保留黑白与留白，方便快速浏览。
        </p>
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
      <article class="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
        <header class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold">
              库存关注列表
            </h2>
            <p class="text-sm text-neutral-500">
              来源：/api/products 与 /api/reports/inventory_alerts
            </p>
          </div>
          <RouterLink class="text-xs uppercase tracking-[0.3em] text-neutral-500" to="/plan">
            查看计划
          </RouterLink>
        </header>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
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

      <article class="bg-white border border-neutral-200 rounded-xl p-5 space-y-6">
        <header>
          <h2 class="text-xl font-semibold">
            库存预警 / 日程
          </h2>
          <p class="text-sm text-neutral-500">
            对应报表 API + 今日操作列表
          </p>
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
        <ul class="space-y-3 border-t border-neutral-100 pt-4 text-sm">
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

    <section class="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
      <header class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold">
            操作便捷入口
          </h2>
          <p class="text-sm text-neutral-500">
            常用模块入口，保持中文与黑白风格。
          </p>
        </div>
        <p class="text-xs text-neutral-400 uppercase tracking-[0.3em]">
          快捷指令
        </p>
      </header>
      <div class="grid gap-3 md:grid-cols-4">
        <RouterLink
          class="border border-neutral-900 rounded-md text-center py-3 text-sm tracking-[0.3em]"
          to="/auth/login"
        >
          登录后台
        </RouterLink>
        <RouterLink
          class="border border-neutral-900 rounded-md text-center py-3 text-sm tracking-[0.3em]"
          to="/auth/register"
        >
          注册账号
        </RouterLink>
        <RouterLink
          class="border border-neutral-900 rounded-md text-center py-3 text-sm tracking-[0.3em]"
          to="/plan"
        >
          查看计划
        </RouterLink>
        <a
          class="border border-neutral-900 rounded-md text-center py-3 text-sm tracking-[0.3em]"
          href="/API_PLAN.md"
          target="_blank"
          rel="noreferrer"
        >
          打开文档
        </a>
      </div>
    </section>
  </section>
</template>
