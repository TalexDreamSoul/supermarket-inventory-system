<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import PaginationBar from '~/components/PaginationBar.vue'
import { useAuth } from '~/composables/useAuth'
import { ApiError } from '~/services/api-client'
import { catalogService, type SupplierListItem, type SupplierPayload } from '~/services/catalog'

defineOptions({
  name: 'SuppliersPage',
})

const { token, isAuthenticated, logout } = useAuth()

const filters = reactive({
  keyword: '',
})

const page = ref(1)
const size = ref(20)
const total = ref(0)
const items = ref<SupplierListItem[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const statusMessage = ref<string | null>(null)

const createForm = reactive<SupplierPayload>({
  supplier_name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
})

const editingId = ref<number | null>(null)
const editForm = reactive<SupplierPayload>({
  supplier_name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
})

async function fetchList() {
  loading.value = true
  errorMessage.value = null
  statusMessage.value = null
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

function ensureAuth(): string | null {
  const currentToken = token.value
  if (!currentToken) {
    errorMessage.value = '需要登录后才能新增/修改/删除。'
    return null
  }
  return currentToken
}

function resetCreateForm() {
  createForm.supplier_name = ''
  createForm.contact_person = ''
  createForm.phone = ''
  createForm.email = ''
  createForm.address = ''
}

function resetEditForm() {
  editingId.value = null
  editForm.supplier_name = ''
  editForm.contact_person = ''
  editForm.phone = ''
  editForm.email = ''
  editForm.address = ''
}

async function handleCreate() {
  const currentToken = ensureAuth()
  if (!currentToken)
    return

  loading.value = true
  errorMessage.value = null
  statusMessage.value = null
  try {
    await catalogService.createSupplier(currentToken, {
      supplier_name: createForm.supplier_name.trim(),
      contact_person: createForm.contact_person?.trim() || undefined,
      phone: createForm.phone?.trim() || undefined,
      email: createForm.email?.trim() || undefined,
      address: createForm.address?.trim() || undefined,
    })
    statusMessage.value = '供应商创建好了。'
    resetCreateForm()
    page.value = 1
    await fetchList()
  }
  catch (error) {
    handleApiError(error)
  }
  finally {
    loading.value = false
  }
}

function startEdit(row: SupplierListItem) {
  editingId.value = row.supplier_id
  editForm.supplier_name = row.supplier_name
  editForm.contact_person = row.contact_person || ''
  editForm.phone = row.phone || ''
  editForm.email = row.email || ''
  editForm.address = row.address || ''
  statusMessage.value = null
  errorMessage.value = null
}

async function handleUpdate() {
  const currentToken = ensureAuth()
  if (!currentToken || editingId.value === null)
    return

  loading.value = true
  errorMessage.value = null
  statusMessage.value = null
  try {
    await catalogService.updateSupplier(editingId.value, currentToken, {
      supplier_name: editForm.supplier_name.trim(),
      contact_person: editForm.contact_person?.trim() || undefined,
      phone: editForm.phone?.trim() || undefined,
      email: editForm.email?.trim() || undefined,
      address: editForm.address?.trim() || undefined,
    })
    statusMessage.value = '供应商更新完成。'
    resetEditForm()
    await fetchList()
  }
  catch (error) {
    handleApiError(error)
  }
  finally {
    loading.value = false
  }
}

async function handleDelete(supplierId: number) {
  const currentToken = ensureAuth()
  if (!currentToken)
    return

  const ok = window.confirm('确认删除这个供应商？有商品引用会删不掉。')
  if (!ok)
    return

  loading.value = true
  errorMessage.value = null
  statusMessage.value = null
  try {
    await catalogService.deleteSupplier(supplierId, currentToken)
    statusMessage.value = '供应商删掉了。'
    if (items.value.length === 1 && page.value > 1)
      page.value -= 1
    await fetchList()
  }
  catch (error) {
    handleApiError(error)
  }
  finally {
    loading.value = false
  }
}

function handleApiError(error: unknown) {
  if (error instanceof ApiError && (error.status === 401 || error.code === 401)) {
    errorMessage.value = '登录过期了，重新登录。'
    logout()
    return
  }
  errorMessage.value = error instanceof Error ? error.message : '操作失败。'
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

    <section class="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <h2 class="text-lg font-semibold">
          新增供应商
        </h2>
        <p v-if="!isAuthenticated" class="text-sm text-neutral-500">
          需要登录才能新增/修改/删除。
        </p>
      </div>

      <form class="grid gap-3 md:grid-cols-6" @submit.prevent="handleCreate">
        <label class="space-y-1 md:col-span-2">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">供应商名称</span>
          <input
            v-model="createForm.supplier_name"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="必填"
            required
          >
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">联系人</span>
          <input
            v-model="createForm.contact_person"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="选填"
          >
        </label>

        <label class="space-y-1">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">电话</span>
          <input
            v-model="createForm.phone"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="选填"
          >
        </label>

        <label class="space-y-1 md:col-span-2">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">邮箱</span>
          <input
            v-model="createForm.email"
            type="email"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="选填"
          >
        </label>

        <label class="space-y-1 md:col-span-6">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">地址</span>
          <input
            v-model="createForm.address"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="选填"
          >
        </label>

        <div class="md:col-span-6 flex gap-2">
          <button
            type="submit"
            class="border border-neutral-900 rounded-md px-4 py-2 text-xs tracking-[0.3em] uppercase"
            :disabled="loading || !createForm.supplier_name.trim()"
          >
            {{ loading ? '提交中' : '添加供应商' }}
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
      <p v-if="statusMessage" class="mt-4 text-sm text-green-700 border border-green-200 rounded-md px-3 py-2 bg-green-50">
        {{ statusMessage }}
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
            <th class="px-4 py-3 text-left">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="text-neutral-800">
          <tr v-for="row in items" :key="row.supplier_id" class="border-t border-neutral-100">
            <td class="px-4 py-3 font-medium">
              <div v-if="editingId === row.supplier_id" class="space-y-2">
                <input
                  v-model="editForm.supplier_name"
                  class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
                  required
                >
              </div>
              <span v-else>
                {{ row.supplier_name }}
              </span>
            </td>
            <td class="px-4 py-3 text-neutral-600">
              <div v-if="editingId === row.supplier_id" class="space-y-2">
                <input
                  v-model="editForm.contact_person"
                  class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
                  placeholder="选填"
                >
              </div>
              <span v-else>
                {{ row.contact_person || '-' }}
              </span>
            </td>
            <td class="px-4 py-3 text-neutral-600 font-mono">
              <div v-if="editingId === row.supplier_id" class="space-y-2">
                <input
                  v-model="editForm.phone"
                  class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
                  placeholder="选填"
                >
              </div>
              <span v-else>
                {{ row.phone || '-' }}
              </span>
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
            <td class="px-4 py-3 text-neutral-600">
              <div class="flex flex-wrap gap-2">
                <button
                  v-if="editingId === row.supplier_id"
                  type="button"
                  class="border border-neutral-900 rounded-md px-3 py-1 text-xs uppercase"
                  :disabled="loading"
                  @click="handleUpdate"
                >
                  保存
                </button>
                <button
                  v-if="editingId === row.supplier_id"
                  type="button"
                  class="border border-neutral-200 rounded-md px-3 py-1 text-xs uppercase text-neutral-600"
                  :disabled="loading"
                  @click="resetEditForm"
                >
                  取消
                </button>
                <button
                  v-else
                  type="button"
                  class="border border-neutral-200 rounded-md px-3 py-1 text-xs uppercase text-neutral-600"
                  @click="startEdit(row)"
                >
                  编辑
                </button>
                <button
                  v-if="editingId !== row.supplier_id"
                  type="button"
                  class="border border-red-200 rounded-md px-3 py-1 text-xs uppercase text-red-600"
                  :disabled="loading"
                  @click="handleDelete(row.supplier_id)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!items.length && !loading">
            <td colspan="7" class="px-4 py-8 text-center text-neutral-400">
              暂无数据
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="7" class="px-4 py-8 text-center text-neutral-400">
              加载中...
            </td>
          </tr>
        </tbody>
      </table>
    </article>

    <PaginationBar v-model:page="page" v-model:size="size" :total="total" />
  </section>
</template>
