<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import PaginationBar from '~/components/PaginationBar.vue'
import { catalogService, type CategoryListItem, type SupplierListItem } from '~/services/catalog'
import { dashboardService, type ProductListItem } from '~/services/dashboard'

defineOptions({
  name: 'ProductsPage',
})

const filters = reactive({
  keyword: '',
  status: '',
  category_id: '',
  supplier_id: '',
})

const categories = ref<CategoryListItem[]>([])
const suppliers = ref<SupplierListItem[]>([])

const page = ref(1)
const size = ref(20)
const total = ref(0)
const items = ref<ProductListItem[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)

function toNumber(value: string) {
  if (!value)
    return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

async function loadOptions() {
  const [categoryResult, supplierResult] = await Promise.allSettled([
    catalogService.fetchCategories({ page: 1, size: 200 }),
    catalogService.fetchSuppliers({ page: 1, size: 200 }),
  ])

  if (categoryResult.status === 'fulfilled')
    categories.value = categoryResult.value.data.items ?? []
  if (supplierResult.status === 'fulfilled')
    suppliers.value = supplierResult.value.data.items ?? []
}

async function fetchList() {
  loading.value = true
  errorMessage.value = null
  try {
    const response = await dashboardService.fetchProducts({
      page: page.value,
      size: size.value,
      keyword: filters.keyword.trim() || undefined,
      status: filters.status || undefined,
      category_id: toNumber(filters.category_id),
      supplier_id: toNumber(filters.supplier_id),
    })
    items.value = response.data.items ?? []
    total.value = response.data.total ?? 0
  }
  catch (error) {
    items.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '商品列表拉取失败。'
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

onMounted(async () => {
  await loadOptions()
  await fetchList()
})
</script>

<template>
  <section class="h-full min-h-0 flex flex-col gap-4 text-left">
    <header class="space-y-2">
      <h1 class="text-3xl font-semibold">
        库存查询
      </h1>
      <p class="text-sm text-neutral-500">
        商品维度展示库存、阈值与状态，支持筛选与分页。
      </p>
    </header>

    <form class="bg-white border border-neutral-200 rounded-xl p-5 space-y-4" @submit.prevent="handleSearch">
      <div class="grid gap-3 md:grid-cols-5">
        <label class="space-y-1 md:col-span-2">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">关键字</span>
          <input
            v-model="filters.keyword"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="编码 / 名称"
            autocomplete="off"
          >
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">状态</span>
          <select v-model="filters.status" class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">
              全部
            </option>
            <option value="active">
              active
            </option>
            <option value="out_of_stock">
              out_of_stock
            </option>
            <option value="inactive">
              inactive
            </option>
            <option value="discontinued">
              discontinued
            </option>
            <option value="pending">
              pending
            </option>
          </select>
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">分类</span>
          <select v-model="filters.category_id" class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">
              全部
            </option>
            <option v-for="category in categories" :key="category.category_id" :value="String(category.category_id)">
              {{ category.category_name }}
            </option>
          </select>
        </label>

        <div class="flex items-end gap-2">
          <label class="space-y-1 flex-1">
            <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">供应商</span>
            <select v-model="filters.supplier_id" class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm bg-white">
              <option value="">
                全部
              </option>
              <option v-for="supplier in suppliers" :key="supplier.supplier_id" :value="String(supplier.supplier_id)">
                {{ supplier.supplier_name }}
              </option>
            </select>
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

    <article class="flex-1 min-h-0 bg-white border border-neutral-200 rounded-xl overflow-auto">
      <table class="w-full text-sm">
        <thead class="bg-neutral-50 text-xs uppercase tracking-[0.3em] text-neutral-500">
          <tr>
            <th class="px-4 py-3 text-left">
              编码
            </th>
            <th class="px-4 py-3 text-left">
              名称
            </th>
            <th class="px-4 py-3 text-left">
              分类
            </th>
            <th class="px-4 py-3 text-left">
              供应商
            </th>
            <th class="px-4 py-3 text-right">
              库存
            </th>
            <th class="px-4 py-3 text-right">
              最小
            </th>
            <th class="px-4 py-3 text-left">
              状态
            </th>
            <th class="px-4 py-3 text-left">
              更新时间
            </th>
          </tr>
        </thead>
        <tbody class="text-neutral-800">
          <tr v-for="row in items" :key="row.product_id" class="border-t border-neutral-100">
            <td class="px-4 py-3 font-mono tracking-[0.2em]">
              {{ row.product_code }}
            </td>
            <td class="px-4 py-3">
              {{ row.product_name }}
            </td>
            <td class="px-4 py-3 text-neutral-600">
              {{ row.category_name || row.category_id || '-' }}
            </td>
            <td class="px-4 py-3 text-neutral-600">
              {{ row.supplier_name || row.supplier_id || '-' }}
            </td>
            <td class="px-4 py-3 text-right font-mono">
              {{ row.stock ?? 0 }}
            </td>
            <td class="px-4 py-3 text-right font-mono">
              {{ row.min_stock ?? 0 }}
            </td>
            <td class="px-4 py-3 text-neutral-600 capitalize">
              {{ row.status ?? '-' }}
            </td>
            <td class="px-4 py-3 text-neutral-500">
              {{ row.updated_at || '-' }}
            </td>
          </tr>

          <tr v-if="!items.length && !loading">
            <td colspan="8" class="px-4 py-8 text-center text-neutral-400">
              暂无数据
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="8" class="px-4 py-8 text-center text-neutral-400">
              加载中...
            </td>
          </tr>
        </tbody>
      </table>
    </article>

    <PaginationBar v-model:page="page" v-model:size="size" :total="total" />
  </section>
</template>
