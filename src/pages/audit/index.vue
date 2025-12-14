<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import PaginationBar from '~/components/PaginationBar.vue'
import { useAuth } from '~/composables/useAuth'
import { type StockOperationItem, type StockOperationType, stockService } from '~/services/stock'

defineOptions({
  name: 'StockAuditPage',
})

const { token, isAuthenticated } = useAuth()

const filters = reactive({
  keyword: '',
  type: '' as '' | StockOperationType,
  start_date: '',
  end_date: '',
})

const page = ref(1)
const size = ref(20)
const total = ref(0)
const items = ref<StockOperationItem[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)

function opLabel(value: StockOperationType) {
  return {
    in: '入库',
    out: '出库',
    adjust: '调整',
    transfer: '调拨',
  }[value] ?? value
}

function displayTime(row: StockOperationItem) {
  return row.operation_date || row.created_at || '-'
}

async function fetchList() {
  const currentToken = token.value
  if (!currentToken) {
    items.value = []
    total.value = 0
    return
  }

  loading.value = true
  errorMessage.value = null
  try {
    const response = await stockService.fetchOperations(currentToken, {
      page: page.value,
      size: size.value,
      keyword: filters.keyword.trim() || undefined,
      type: filters.type || undefined,
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
    })
    items.value = response.data.items ?? []
    total.value = response.data.total ?? 0
  }
  catch (error) {
    items.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '审计流水拉取失败。'
  }
  finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchList()
}

watch([page, size], () => {
  fetchList()
})

watch(() => token.value, () => {
  page.value = 1
  fetchList()
})

onMounted(() => {
  fetchList()
})
</script>

<template>
  <section class="h-full min-h-0 flex flex-col gap-4 text-left">
    <header class="space-y-2">
      <h1 class="text-3xl font-semibold">
        库存审计
      </h1>
      <p class="text-sm text-neutral-500">
        查看库存流水（入库/出库/调整），支持筛选、日期范围与分页。
      </p>
    </header>

    <div v-if="!isAuthenticated" class="bg-white border border-neutral-200 rounded-xl p-5">
      <p class="text-sm text-neutral-600">
        这个页面需要登录拿 token 才能查审计流水。
      </p>
      <RouterLink class="inline-block mt-3 text-sm text-neutral-600 underline underline-offset-4" to="/auth/login">
        去登录
      </RouterLink>
    </div>

    <form v-else class="bg-white border border-neutral-200 rounded-xl p-5 space-y-4" @submit.prevent="handleSearch">
      <div class="grid gap-3 md:grid-cols-6">
        <label class="space-y-1 md:col-span-2">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">关键字</span>
          <input
            v-model="filters.keyword"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="商品编码 / 名称"
            autocomplete="off"
          >
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">类型</span>
          <select v-model="filters.type" class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">
              全部
            </option>
            <option value="in">
              in
            </option>
            <option value="out">
              out
            </option>
            <option value="adjust">
              adjust
            </option>
            <option value="transfer">
              transfer
            </option>
          </select>
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">开始日期</span>
          <input
            v-model="filters.start_date"
            type="date"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
          >
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">结束日期</span>
          <input
            v-model="filters.end_date"
            type="date"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
          >
        </label>

        <div class="flex items-end">
          <button
            type="submit"
            class="border border-neutral-900 rounded-md px-4 py-2 text-xs tracking-[0.3em] uppercase w-full"
            :disabled="loading"
          >
            {{ loading ? '查询中' : '查询' }}
          </button>
        </div>
      </div>

      <p v-if="errorMessage" class="text-sm text-red-600 border border-red-200 rounded-md px-3 py-2 bg-red-50">
        {{ errorMessage }}
      </p>
    </form>

    <article v-if="isAuthenticated" class="flex-1 min-h-0 bg-white border border-neutral-200 rounded-xl overflow-auto">
      <table class="w-full text-sm">
        <thead class="bg-neutral-50 text-xs uppercase tracking-[0.3em] text-neutral-500">
          <tr>
            <th class="px-4 py-3 text-left">
              时间
            </th>
            <th class="px-4 py-3 text-left">
              商品
            </th>
            <th class="px-4 py-3 text-left">
              类型
            </th>
            <th class="px-4 py-3 text-right">
              数量
            </th>
            <th class="px-4 py-3 text-right">
              前
            </th>
            <th class="px-4 py-3 text-right">
              后
            </th>
            <th class="px-4 py-3 text-right">
              金额
            </th>
            <th class="px-4 py-3 text-left">
              原因/动作
            </th>
            <th class="px-4 py-3 text-left">
              订单
            </th>
          </tr>
        </thead>
        <tbody class="text-neutral-800">
          <tr v-for="row in items" :key="row.op_id" class="border-t border-neutral-100">
            <td class="px-4 py-3 text-neutral-600">
              {{ displayTime(row) }}
            </td>
            <td class="px-4 py-3">
              <p class="font-mono tracking-[0.2em]">
                {{ row.product_code || row.product_id }}
              </p>
              <p class="text-neutral-600">
                {{ row.product_name || '-' }}
              </p>
            </td>
            <td class="px-4 py-3 text-neutral-600">
              {{ opLabel(row.op_type) }}
            </td>
            <td class="px-4 py-3 text-right font-mono">
              {{ row.quantity }}
            </td>
            <td class="px-4 py-3 text-right font-mono text-neutral-600">
              {{ row.stock_before }}
            </td>
            <td class="px-4 py-3 text-right font-mono text-neutral-600">
              {{ row.stock_after }}
            </td>
            <td class="px-4 py-3 text-right font-mono">
              {{ row.total_price ?? '-' }}
            </td>
            <td class="px-4 py-3 text-neutral-600">
              <p>{{ row.reason || '-' }}</p>
              <p class="text-neutral-500">
                {{ row.operator_action || '-' }}
              </p>
            </td>
            <td class="px-4 py-3 text-neutral-600 font-mono">
              {{ row.order_id || '-' }}
            </td>
          </tr>

          <tr v-if="!items.length && !loading">
            <td colspan="9" class="px-4 py-8 text-center text-neutral-400">
              暂无数据
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="9" class="px-4 py-8 text-center text-neutral-400">
              加载中...
            </td>
          </tr>
        </tbody>
      </table>
    </article>

    <PaginationBar v-if="isAuthenticated" v-model:page="page" v-model:size="size" :total="total" />
  </section>
</template>
