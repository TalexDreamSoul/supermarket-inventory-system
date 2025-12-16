<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import PaginationBar from '~/components/PaginationBar.vue'
import { useAuth } from '~/composables/useAuth'
import { ApiError } from '~/services/api-client'
import { catalogService, type CategoryListItem, type SupplierListItem } from '~/services/catalog'
import { productService, type ProductListItem } from '~/services/products'
import { stockService } from '~/services/stock'

defineOptions({
  name: 'ProductsPage',
})

const { token, isAuthenticated, logout } = useAuth()

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
const statusMessage = ref<string | null>(null)

const statusOptions = ['active', 'out_of_stock', 'inactive', 'discontinued', 'pending']

const createForm = reactive({
  product_code: '',
  product_name: '',
  category_id: '',
  supplier_id: '',
  purchase_price: '',
  sale_price: '',
  min_stock: '10',
  max_stock: '100',
  storage_location: '',
})

const editingId = ref<number | null>(null)
const editForm = reactive({
  product_name: '',
  category_id: '',
  supplier_id: '',
  purchase_price: '',
  sale_price: '',
  min_stock: '',
  max_stock: '',
  storage_location: '',
  status: '',
})

const stockForm = reactive({
  op_type: 'in' as 'in' | 'out' | 'adjust',
  product_id: '',
  quantity: '',
  new_stock: '',
  unit_price: '',
  reason: '',
  notes: '',
  order_id: '',
})

function toNumber(value: string | number | null | undefined) {
  if (value === undefined || value === null || value === '')
    return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function requireNumber(value: string, label: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    errorMessage.value = `${label} 要填数字，别糊弄老王。`
    return null
  }
  return parsed
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
  statusMessage.value = null
  try {
    const response = await productService.fetchProducts({
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

function ensureAuth(): string | null {
  const currentToken = token.value
  if (!currentToken) {
    errorMessage.value = '这个操作需要登录，去登录页拿个 token。'
    return null
  }
  return currentToken
}

function resetCreateForm() {
  createForm.product_code = ''
  createForm.product_name = ''
  createForm.category_id = ''
  createForm.supplier_id = ''
  createForm.purchase_price = ''
  createForm.sale_price = ''
  createForm.min_stock = '10'
  createForm.max_stock = '100'
  createForm.storage_location = ''
}

function resetEditForm() {
  editingId.value = null
  editForm.product_name = ''
  editForm.category_id = ''
  editForm.supplier_id = ''
  editForm.purchase_price = ''
  editForm.sale_price = ''
  editForm.min_stock = ''
  editForm.max_stock = ''
  editForm.storage_location = ''
  editForm.status = ''
}

function resetStockForm() {
  stockForm.op_type = 'in'
  stockForm.product_id = ''
  stockForm.quantity = ''
  stockForm.new_stock = ''
  stockForm.unit_price = ''
  stockForm.reason = ''
  stockForm.notes = ''
  stockForm.order_id = ''
}

function handleApiError(error: unknown, fallback = '操作失败。') {
  if (error instanceof ApiError && (error.status === 401 || error.code === 401)) {
    errorMessage.value = '登录过期了，重新登录。'
    logout()
    return
  }
  errorMessage.value = error instanceof Error ? error.message : fallback
}

async function handleCreateProduct() {
  const currentToken = ensureAuth()
  if (!currentToken)
    return

  if (!createForm.product_code.trim() || !createForm.product_name.trim() || !createForm.category_id) {
    errorMessage.value = '编码、名称、分类这些基础字段一个都不能少。'
    return
  }

  const categoryId = Number(createForm.category_id)
  if (!Number.isFinite(categoryId)) {
    errorMessage.value = '分类字段传个正常的数字 ID。'
    return
  }

  const purchasePrice = requireNumber(createForm.purchase_price, '采购价')
  if (purchasePrice === null)
    return
  const salePrice = requireNumber(createForm.sale_price, '销售价')
  if (salePrice === null)
    return

  loading.value = true
  errorMessage.value = null
  statusMessage.value = null
  try {
    await productService.createProduct(currentToken, {
      product_code: createForm.product_code.trim(),
      product_name: createForm.product_name.trim(),
      category_id: categoryId,
      supplier_id: toNumber(createForm.supplier_id),
      purchase_price: purchasePrice,
      sale_price: salePrice,
      min_stock: toNumber(createForm.min_stock),
      max_stock: toNumber(createForm.max_stock),
      storage_location: createForm.storage_location.trim() || undefined,
    })
    statusMessage.value = '商品创建成功，赶紧去看看库存。'
    resetCreateForm()
    page.value = 1
    await fetchList()
  }
  catch (error) {
    handleApiError(error, '创建商品失败。')
  }
  finally {
    loading.value = false
  }
}

function startEdit(row: ProductListItem) {
  editingId.value = row.product_id
  editForm.product_name = row.product_name
  editForm.category_id = row.category_id ? String(row.category_id) : ''
  editForm.supplier_id = row.supplier_id ? String(row.supplier_id) : ''
  editForm.purchase_price = row.purchase_price !== undefined && row.purchase_price !== null ? String(row.purchase_price) : ''
  editForm.sale_price = row.sale_price !== undefined && row.sale_price !== null ? String(row.sale_price) : ''
  editForm.min_stock = row.min_stock !== undefined && row.min_stock !== null ? String(row.min_stock) : ''
  editForm.max_stock = row.max_stock !== undefined && row.max_stock !== null ? String(row.max_stock) : ''
  editForm.storage_location = row.storage_location || ''
  editForm.status = row.status || ''
  statusMessage.value = null
  errorMessage.value = null
}

async function handleUpdateProduct() {
  const currentToken = ensureAuth()
  if (!currentToken || editingId.value === null)
    return

  if (!editForm.product_name.trim()) {
    errorMessage.value = '商品名称不能为空。'
    return
  }

  const purchasePrice = editForm.purchase_price ? requireNumber(editForm.purchase_price, '采购价') : null
  if (editForm.purchase_price && purchasePrice === null)
    return
  const salePrice = editForm.sale_price ? requireNumber(editForm.sale_price, '销售价') : null
  if (editForm.sale_price && salePrice === null)
    return

  loading.value = true
  errorMessage.value = null
  statusMessage.value = null
  try {
    await productService.updateProduct(editingId.value, currentToken, {
      product_name: editForm.product_name.trim(),
      category_id: toNumber(editForm.category_id),
      supplier_id: toNumber(editForm.supplier_id),
      purchase_price: purchasePrice ?? undefined,
      sale_price: salePrice ?? undefined,
      min_stock: toNumber(editForm.min_stock),
      max_stock: toNumber(editForm.max_stock),
      storage_location: editForm.storage_location.trim() || undefined,
      status: editForm.status || undefined,
    })
    statusMessage.value = '商品更新完成。'
    resetEditForm()
    await fetchList()
  }
  catch (error) {
    handleApiError(error, '更新商品失败。')
  }
  finally {
    loading.value = false
  }
}

async function handleDeleteProduct(productId: number) {
  const currentToken = ensureAuth()
  if (!currentToken)
    return

  const ok = window.confirm('确认删除这个商品？有关联库存流水会被自动禁用。')
  if (!ok)
    return

  loading.value = true
  errorMessage.value = null
  statusMessage.value = null
  try {
    await productService.deleteProduct(productId, currentToken)
    statusMessage.value = '商品删除/禁用处理完成。'
    if (items.value.length === 1 && page.value > 1)
      page.value -= 1
    await fetchList()
  }
  catch (error) {
    handleApiError(error, '删除商品失败。')
  }
  finally {
    loading.value = false
  }
}

async function handleStockSubmit() {
  const currentToken = ensureAuth()
  if (!currentToken)
    return

  const productId = Number(stockForm.product_id)
  if (!Number.isFinite(productId)) {
    errorMessage.value = '库存操作需要合法的商品 ID。'
    return
  }

  loading.value = true
  errorMessage.value = null
  statusMessage.value = null
  try {
    if (stockForm.op_type === 'adjust') {
      const newStock = requireNumber(stockForm.new_stock, '目标库存')
      if (newStock === null)
        return
      await stockService.adjustStock(currentToken, {
        product_id: productId,
        new_stock: newStock,
        reason: stockForm.reason.trim() || undefined,
        notes: stockForm.notes.trim() || undefined,
      })
    }
    else {
      const quantity = requireNumber(stockForm.quantity, '数量')
      if (quantity === null)
        return
      const payload = {
        product_id: productId,
        quantity,
        reason: stockForm.reason.trim() || undefined,
        unit_price: toNumber(stockForm.unit_price),
        order_id: stockForm.order_id.trim() || undefined,
      }
      if (stockForm.op_type === 'in')
        await stockService.stockIn(currentToken, payload)
      else
        await stockService.stockOut(currentToken, payload)
    }
    statusMessage.value = '库存操作记录成功，表格数据也刷新了。'
    resetStockForm()
    await fetchList()
  }
  catch (error) {
    handleApiError(error, '库存操作失败。')
  }
  finally {
    loading.value = false
  }
}

watch([page, size], () => {
  fetchList()
})

watch(() => token.value, () => {
  page.value = 1
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
        商品维度展示库存、阈值与状态，支持筛选、创建与库存操作。
      </p>
    </header>

    <section class="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <h2 class="text-lg font-semibold">
          新增商品
        </h2>
        <p v-if="!isAuthenticated" class="text-sm text-neutral-500">
          需要登录后才能新增/修改/删除/操作库存。
        </p>
      </div>

      <form class="grid gap-3 md:grid-cols-6" @submit.prevent="handleCreateProduct">
        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">编码</span>
          <input
            v-model="createForm.product_code"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="必填"
            required
          >
        </label>

        <label class="space-y-1 md:col-span-2">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">名称</span>
          <input
            v-model="createForm.product_name"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="必填"
            required
          >
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">分类</span>
          <select v-model="createForm.category_id" class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm bg-white" required>
            <option value="">
              选择
            </option>
            <option v-for="category in categories" :key="category.category_id" :value="String(category.category_id)">
              {{ category.category_name }}
            </option>
          </select>
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">供应商</span>
          <select v-model="createForm.supplier_id" class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm bg-white">
            <option value="">
              选择
            </option>
            <option v-for="supplier in suppliers" :key="supplier.supplier_id" :value="String(supplier.supplier_id)">
              {{ supplier.supplier_name }}
            </option>
          </select>
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">采购价</span>
          <input
            v-model="createForm.purchase_price"
            type="number"
            min="0"
            step="0.01"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="必填"
            required
          >
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">销售价</span>
          <input
            v-model="createForm.sale_price"
            type="number"
            min="0"
            step="0.01"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="必填"
            required
          >
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">最小库存</span>
          <input
            v-model="createForm.min_stock"
            type="number"
            min="0"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="默认 10"
          >
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">最大库存</span>
          <input
            v-model="createForm.max_stock"
            type="number"
            min="0"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="默认 100"
          >
        </label>

        <label class="space-y-1 md:col-span-2">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">库位</span>
          <input
            v-model="createForm.storage_location"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="选填"
          >
        </label>

        <div class="md:col-span-6 flex gap-2">
          <button
            type="submit"
            class="border border-neutral-900 rounded-md px-4 py-2 text-xs tracking-[0.3em] uppercase"
            :disabled="loading"
          >
            {{ loading ? '提交中' : '添加商品' }}
          </button>
          <button
            type="button"
            class="text-sm text-neutral-600 underline underline-offset-4"
            @click="resetCreateForm"
          >
            重置
          </button>
        </div>
      </form>
    </section>

    <section class="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
      <h2 class="text-lg font-semibold">
        库存操作
      </h2>
      <form class="grid gap-3 md:grid-cols-5" @submit.prevent="handleStockSubmit">
        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">类型</span>
          <select v-model="stockForm.op_type" class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm bg-white">
            <option value="in">
              入库
            </option>
            <option value="out">
              出库
            </option>
            <option value="adjust">
              调整
            </option>
          </select>
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">商品 ID</span>
          <input
            v-model="stockForm.product_id"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="必填"
          >
        </label>

        <label class="space-y-1" :class="stockForm.op_type === 'adjust' ? 'md:col-span-2' : ''">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">
            {{ stockForm.op_type === 'adjust' ? '目标库存' : '数量' }}
          </span>
          <input
            v-if="stockForm.op_type === 'adjust'"
            v-model="stockForm.new_stock"
            type="number"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="必填"
          >
          <input
            v-else
            v-model="stockForm.quantity"
            type="number"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="必填"
          >
        </label>

        <label v-if="stockForm.op_type !== 'adjust'" class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">单价</span>
          <input
            v-model="stockForm.unit_price"
            type="number"
            step="0.01"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="可空"
          >
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">原因</span>
          <input
            v-model="stockForm.reason"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="可空"
          >
        </label>

        <label v-if="stockForm.op_type !== 'adjust'" class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">订单 ID</span>
          <input
            v-model="stockForm.order_id"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="可空"
          >
        </label>

        <label v-if="stockForm.op_type === 'adjust'" class="space-y-1 md:col-span-2">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">额外备注</span>
          <input
            v-model="stockForm.notes"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="可空"
          >
        </label>

        <div class="md:col-span-5 flex gap-2">
          <button
            type="submit"
            class="border border-neutral-900 rounded-md px-4 py-2 text-xs tracking-[0.3em] uppercase"
            :disabled="loading"
          >
            {{ loading ? '提交中' : '执行库存操作' }}
          </button>
          <button type="button" class="text-sm text-neutral-600 underline underline-offset-4" @click="resetStockForm">
            重置
          </button>
        </div>
      </form>
    </section>

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
            <option v-for="status in statusOptions" :key="status" :value="status">
              {{ status }}
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

        <label class="space-y-1">
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

        <div class="flex items-end gap-2">
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
      <p v-if="statusMessage" class="text-sm text-green-700 border border-green-200 rounded-md px-3 py-2 bg-green-50">
        {{ statusMessage }}
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
            <th class="px-4 py-3 text-right">
              最大
            </th>
            <th class="px-4 py-3 text-left">
              库位
            </th>
            <th class="px-4 py-3 text-left">
              状态
            </th>
            <th class="px-4 py-3 text-left">
              更新时间
            </th>
            <th class="px-4 py-3 text-left">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="text-neutral-800">
          <tr v-for="row in items" :key="row.product_id" class="border-t border-neutral-100">
            <td class="px-4 py-3 font-mono tracking-[0.2em]">
              {{ row.product_code }}
            </td>
            <td class="px-4 py-3">
              <template v-if="editingId === row.product_id">
                <input
                  v-model="editForm.product_name"
                  class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
                  required
                >
              </template>
              <template v-else>
                {{ row.product_name }}
              </template>
            </td>
            <td class="px-4 py-3 text-neutral-600">
              <template v-if="editingId === row.product_id">
                <select v-model="editForm.category_id" class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">
                    不改
                  </option>
                  <option v-for="category in categories" :key="category.category_id" :value="String(category.category_id)">
                    {{ category.category_name }}
                  </option>
                </select>
              </template>
              <template v-else>
                {{ row.category_name || row.category_id || '-' }}
              </template>
            </td>
            <td class="px-4 py-3 text-neutral-600">
              <template v-if="editingId === row.product_id">
                <select v-model="editForm.supplier_id" class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">
                    不改
                  </option>
                  <option v-for="supplier in suppliers" :key="supplier.supplier_id" :value="String(supplier.supplier_id)">
                    {{ supplier.supplier_name }}
                  </option>
                </select>
              </template>
              <template v-else>
                {{ row.supplier_name || row.supplier_id || '-' }}
              </template>
            </td>
            <td class="px-4 py-3 text-right font-mono">
              {{ row.stock ?? 0 }}
            </td>
            <td class="px-4 py-3 text-right">
              <template v-if="editingId === row.product_id">
                <input
                  v-model="editForm.min_stock"
                  type="number"
                  class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm text-right"
                >
              </template>
              <template v-else>
                {{ row.min_stock ?? 0 }}
              </template>
            </td>
            <td class="px-4 py-3 text-right">
              <template v-if="editingId === row.product_id">
                <input
                  v-model="editForm.max_stock"
                  type="number"
                  class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm text-right"
                >
              </template>
              <template v-else>
                {{ row.max_stock ?? 0 }}
              </template>
            </td>
            <td class="px-4 py-3 text-neutral-600">
              <template v-if="editingId === row.product_id">
                <input
                  v-model="editForm.storage_location"
                  class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
                >
              </template>
              <template v-else>
                {{ row.storage_location || '-' }}
              </template>
            </td>
            <td class="px-4 py-3 text-neutral-600 capitalize">
              <template v-if="editingId === row.product_id">
                <select v-model="editForm.status" class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm bg-white">
                  <option value="">
                    不改
                  </option>
                  <option v-for="status in statusOptions" :key="status" :value="status">
                    {{ status }}
                  </option>
                </select>
              </template>
              <template v-else>
                {{ row.status ?? '-' }}
              </template>
            </td>
            <td class="px-4 py-3 text-neutral-500">
              {{ row.updated_at || '-' }}
            </td>
            <td class="px-4 py-3 text-neutral-600">
              <div class="flex flex-wrap gap-2">
                <template v-if="editingId === row.product_id">
                  <button
                    type="button"
                    class="border border-neutral-900 rounded-md px-3 py-1 text-xs uppercase"
                    :disabled="loading"
                    @click="handleUpdateProduct"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    class="border border-neutral-200 rounded-md px-3 py-1 text-xs uppercase text-neutral-600"
                    :disabled="loading"
                    @click="resetEditForm"
                  >
                    取消
                  </button>
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="border border-neutral-200 rounded-md px-3 py-1 text-xs uppercase text-neutral-600"
                    @click="startEdit(row)"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    class="border border-red-200 rounded-md px-3 py-1 text-xs uppercase text-red-600"
                    :disabled="loading"
                    @click="handleDeleteProduct(row.product_id)"
                  >
                    删除
                  </button>
                </template>
              </div>
            </td>
          </tr>

          <tr v-if="!items.length && !loading">
            <td colspan="11" class="px-4 py-8 text-center text-neutral-400">
              暂无数据
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="11" class="px-4 py-8 text-center text-neutral-400">
              加载中...
            </td>
          </tr>
        </tbody>
      </table>
    </article>

    <PaginationBar v-model:page="page" v-model:size="size" :total="total" />
  </section>
</template>
