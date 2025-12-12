<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import PaginationBar from '~/components/PaginationBar.vue'
import { useAuth } from '~/composables/useAuth'
import { type OrderListItem, orderService, type OrderStatus, type OrderType } from '~/services/orders'

defineOptions({
  name: 'OrdersPage',
})

const { token, isAuthenticated } = useAuth()

const filters = reactive({
  keyword: '',
  order_type: '' as '' | OrderType,
  status: '' as '' | OrderStatus,
  start_date: '',
  end_date: '',
})

const page = ref(1)
const size = ref(20)
const total = ref(0)
const items = ref<OrderListItem[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)

function label(value: string) {
  return value || '-'
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
    const response = await orderService.fetchOrders(currentToken, {
      page: page.value,
      size: size.value,
      keyword: filters.keyword.trim() || undefined,
      order_type: filters.order_type || undefined,
      status: filters.status || undefined,
      start_date: filters.start_date || undefined,
      end_date: filters.end_date || undefined,
    })
    items.value = response.data.items ?? []
    total.value = response.data.total ?? 0
  }
  catch (error) {
    items.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '订单列表拉取失败。'
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
  <section class="space-y-6 text-left">
    <header class="space-y-2">
      <h1 class="text-3xl font-semibold">
        订单管理
      </h1>
      <p class="text-sm text-neutral-500">
        查询采购/销售订单，支持筛选与分页。
      </p>
    </header>

    <div v-if="!isAuthenticated" class="bg-white border border-neutral-200 rounded-xl p-5">
      <p class="text-sm text-neutral-600">
        订单接口需要登录 token。
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
            placeholder="订单号"
            autocomplete="off"
          >
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">类型</span>
          <select v-model="filters.order_type" class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">
              全部
            </option>
            <option value="purchase">
              purchase
            </option>
            <option value="sale">
              sale
            </option>
            <option value="return">
              return
            </option>
            <option value="transfer">
              transfer
            </option>
          </select>
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">状态</span>
          <select v-model="filters.status" class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">
              全部
            </option>
            <option value="pending">
              pending
            </option>
            <option value="processing">
              processing
            </option>
            <option value="completed">
              completed
            </option>
            <option value="cancelled">
              cancelled
            </option>
            <option value="refunded">
              refunded
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

        <div class="flex items-end gap-2">
          <label class="space-y-1 flex-1">
            <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">结束日期</span>
            <input
              v-model="filters.end_date"
              type="date"
              class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            >
          </label>

          <button
            type="submit"
            class="border border-neutral-900 rounded-md px-4 py-2 text-xs tracking-[0.3em] uppercase"
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

    <article v-if="isAuthenticated" class="bg-white border border-neutral-200 rounded-xl overflow-auto">
      <table class="w-full text-sm">
        <thead class="bg-neutral-50 text-xs uppercase tracking-[0.3em] text-neutral-500">
          <tr>
            <th class="px-4 py-3 text-left">
              订单号
            </th>
            <th class="px-4 py-3 text-left">
              类型
            </th>
            <th class="px-4 py-3 text-left">
              状态
            </th>
            <th class="px-4 py-3 text-right">
              金额
            </th>
            <th class="px-4 py-3 text-left">
              创建时间
            </th>
          </tr>
        </thead>
        <tbody class="text-neutral-800">
          <tr v-for="row in items" :key="row.order_id" class="border-t border-neutral-100">
            <td class="px-4 py-3 font-mono tracking-[0.2em]">
              {{ row.order_id }}
            </td>
            <td class="px-4 py-3 text-neutral-600 capitalize">
              {{ label(row.order_type) }}
            </td>
            <td class="px-4 py-3 text-neutral-600 capitalize">
              {{ label(row.status || '') }}
            </td>
            <td class="px-4 py-3 text-right font-mono">
              {{ row.total_amount ?? 0 }}
            </td>
            <td class="px-4 py-3 text-neutral-500">
              {{ row.created_at || '-' }}
            </td>
          </tr>

          <tr v-if="!items.length && !loading">
            <td colspan="5" class="px-4 py-8 text-center text-neutral-400">
              暂无数据
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="5" class="px-4 py-8 text-center text-neutral-400">
              加载中...
            </td>
          </tr>
        </tbody>
      </table>
    </article>

    <PaginationBar v-if="isAuthenticated" v-model:page="page" v-model:size="size" :total="total" />
  </section>
</template>
