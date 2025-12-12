<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { dashboardService } from '~/services/dashboard'

defineOptions({
  name: 'SystemCheckPage',
})

type CheckStatus = 'ok' | 'fail' | 'skip'

interface CheckItem {
  name: string
  status: CheckStatus
  detail: string
}

const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
const { token, isAuthenticated } = useAuth()

const running = ref(false)
const lastRunAt = ref<string | null>(null)
const checks = ref<CheckItem[]>([])

function nowLabel() {
  return new Date().toLocaleString('zh-CN')
}

function toMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

async function runChecks() {
  running.value = true
  lastRunAt.value = nowLabel()
  checks.value = []

  try {
    await dashboardService.fetchProducts({ page: 1, size: 1 })
    checks.value.push({ name: '商品列表 /api/products', status: 'ok', detail: 'OK' })
  }
  catch (error) {
    checks.value.push({ name: '商品列表 /api/products', status: 'fail', detail: toMessage(error) })
  }

  const currentToken = token.value
  if (!currentToken) {
    checks.value.push({ name: '库存报表 /api/reports/inventory_report', status: 'skip', detail: '未登录（需要 token）' })
    checks.value.push({ name: '库存预警 /api/reports/inventory_alerts', status: 'skip', detail: '未登录（需要 token）' })
    running.value = false
    return
  }

  const today = new Date().toISOString().slice(0, 10)

  try {
    await dashboardService.fetchInventoryReport(today, currentToken)
    checks.value.push({ name: '库存报表 /api/reports/inventory_report', status: 'ok', detail: 'OK' })
  }
  catch (error) {
    checks.value.push({ name: '库存报表 /api/reports/inventory_report', status: 'fail', detail: toMessage(error) })
  }

  try {
    await dashboardService.fetchInventoryAlerts(currentToken)
    checks.value.push({ name: '库存预警 /api/reports/inventory_alerts', status: 'ok', detail: 'OK' })
  }
  catch (error) {
    checks.value.push({ name: '库存预警 /api/reports/inventory_alerts', status: 'fail', detail: toMessage(error) })
  }

  running.value = false
}

onMounted(() => {
  runChecks()
})
</script>

<template>
  <section class="max-w-6xl mx-auto text-left space-y-6">
    <header class="space-y-2">
      <p class="text-xs uppercase tracking-[0.3em] text-neutral-500">
        STATUS
      </p>
      <h1 class="text-3xl font-semibold">
        系统检查
      </h1>
      <p class="text-sm text-neutral-500">
        接口：<code>{{ backendBaseUrl || '未配置' }}</code>
      </p>
      <p class="text-sm text-neutral-500">
        登录状态：<span class="font-medium">{{ isAuthenticated ? '已登录' : '未登录' }}</span>
      </p>
    </header>

    <article class="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm space-y-4">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div class="text-sm text-neutral-500">
          <span>最近检查：</span>
          <span>{{ lastRunAt || '暂无' }}</span>
        </div>
        <button
          class="border border-neutral-900 rounded-md px-4 py-2 text-xs tracking-[0.3em] uppercase"
          type="button"
          :disabled="running"
          @click="runChecks"
        >
          {{ running ? '检查中...' : '重新检查' }}
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="item in checks"
          :key="item.name"
          class="border rounded-lg px-4 py-3"
          :class="item.status === 'ok'
            ? 'border-emerald-200 bg-emerald-50'
            : item.status === 'fail'
              ? 'border-red-200 bg-red-50'
              : 'border-neutral-200 bg-white'"
        >
          <div class="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <p class="font-medium">
              {{ item.name }}
            </p>
            <p
              class="text-xs uppercase tracking-[0.3em]"
              :class="item.status === 'ok'
                ? 'text-emerald-700'
                : item.status === 'fail'
                  ? 'text-red-700'
                  : 'text-neutral-500'"
            >
              {{ item.status }}
            </p>
          </div>
          <p class="text-sm text-neutral-600 mt-2 break-words">
            {{ item.detail }}
          </p>
        </div>

        <p v-if="!checks.length" class="text-sm text-neutral-500">
          暂无检查结果
        </p>
      </div>
    </article>
  </section>
</template>
