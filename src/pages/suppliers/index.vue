<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import PaginationBar from '~/components/PaginationBar.vue'
import { catalogService, type SupplierListItem } from '~/services/catalog'

defineOptions({
  name: 'SuppliersPage',
})

const filters = reactive({
  keyword: '',
})

const page = ref(1)
const size = ref(20)
const total = ref(0)
const items = ref<SupplierListItem[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)

async function fetchList() {
  loading.value = true
  errorMessage.value = null
  try {
    const response = await catalogService.fetchSuppliers({
      page: page.value,
      size: size.value,
      keyword: filters.keyword.trim() || undefined,
    })
    items.value = response.data.items ?? []
    total.value = response.data.total ?? 0
  }
  catch (error) {
    items.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '供应商列表拉取失败。'
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

onMounted(() => {
  fetchList()
})
</script>

<template>
  <section class="h-full min-h-0 flex flex-col gap-4 text-left">
    <header class="space-y-2">
      <h1 class="text-3xl font-semibold">
        供应商
      </h1>
      <p class="text-sm text-neutral-500">
        供应商维度查看关联商品数与库存总量，支持搜索与分页。
      </p>
    </header>

    <form class="bg-white border border-neutral-200 rounded-xl p-5" @submit.prevent="handleSearch">
      <div class="flex flex-col gap-3 md:flex-row md:items-end">
        <label class="space-y-1 flex-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">关键字</span>
          <input
            v-model="filters.keyword"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="供应商名称"
            autocomplete="off"
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

      <p v-if="errorMessage" class="mt-4 text-sm text-red-600 border border-red-200 rounded-md px-3 py-2 bg-red-50">
        {{ errorMessage }}
      </p>
    </form>

    <article class="flex-1 min-h-0 bg-white border border-neutral-200 rounded-xl overflow-auto">
      <table class="w-full text-sm">
        <thead class="bg-neutral-50 text-xs uppercase tracking-[0.3em] text-neutral-500">
          <tr>
            <th class="px-4 py-3 text-left">
              供应商
            </th>
            <th class="px-4 py-3 text-left">
              联系人
            </th>
            <th class="px-4 py-3 text-left">
              电话
            </th>
            <th class="px-4 py-3 text-right">
              商品数
            </th>
            <th class="px-4 py-3 text-right">
              库存总量
            </th>
            <th class="px-4 py-3 text-left">
              更新时间
            </th>
          </tr>
        </thead>
        <tbody class="text-neutral-800">
          <tr v-for="row in items" :key="row.supplier_id" class="border-t border-neutral-100">
            <td class="px-4 py-3 font-medium">
              {{ row.supplier_name }}
            </td>
            <td class="px-4 py-3 text-neutral-600">
              {{ row.contact_person || '-' }}
            </td>
            <td class="px-4 py-3 text-neutral-600 font-mono">
              {{ row.phone || '-' }}
            </td>
            <td class="px-4 py-3 text-right font-mono">
              {{ row.product_count ?? 0 }}
            </td>
            <td class="px-4 py-3 text-right font-mono">
              {{ row.total_stock ?? 0 }}
            </td>
            <td class="px-4 py-3 text-neutral-500">
              {{ row.updated_at || '-' }}
            </td>
          </tr>

          <tr v-if="!items.length && !loading">
            <td colspan="6" class="px-4 py-8 text-center text-neutral-400">
              暂无数据
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="6" class="px-4 py-8 text-center text-neutral-400">
              加载中...
            </td>
          </tr>
        </tbody>
      </table>
    </article>

    <PaginationBar v-model:page="page" v-model:size="size" :total="total" />
  </section>
</template>
