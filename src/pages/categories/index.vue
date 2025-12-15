<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import PaginationBar from '~/components/PaginationBar.vue'
import { useAuth } from '~/composables/useAuth'
import { ApiError } from '~/services/api-client'
import { catalogService, type CategoryListItem, type CategoryPayload } from '~/services/catalog'

defineOptions({
  name: 'CategoriesPage',
})

const { token, isAuthenticated, logout } = useAuth()

const filters = reactive({
  keyword: '',
})

const page = ref(1)
const size = ref(20)
const total = ref(0)
const items = ref<CategoryListItem[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const statusMessage = ref<string | null>(null)

const createForm = reactive<CategoryPayload>({
  category_name: '',
  description: '',
})

const editingId = ref<number | null>(null)
const editForm = reactive<CategoryPayload>({
  category_name: '',
  description: '',
})

async function fetchList() {
  loading.value = true
  errorMessage.value = null
  statusMessage.value = null
  try {
    const response = await catalogService.fetchCategories({
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
    errorMessage.value = error instanceof Error ? error.message : '分类列表拉取失败。'
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
  createForm.category_name = ''
  createForm.description = ''
}

function resetEditForm() {
  editingId.value = null
  editForm.category_name = ''
  editForm.description = ''
}

async function handleCreate() {
  const currentToken = ensureAuth()
  if (!currentToken)
    return

  loading.value = true
  errorMessage.value = null
  statusMessage.value = null
  try {
    await catalogService.createCategory(currentToken, {
      category_name: createForm.category_name.trim(),
      description: createForm.description?.trim() || undefined,
    })
    statusMessage.value = '分类创建好了。'
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

function startEdit(row: CategoryListItem) {
  editingId.value = row.category_id
  editForm.category_name = row.category_name
  editForm.description = row.description || ''
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
    await catalogService.updateCategory(editingId.value, currentToken, {
      category_name: editForm.category_name.trim(),
      description: editForm.description?.trim() || undefined,
    })
    statusMessage.value = '分类更新完成。'
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

async function handleDelete(categoryId: number) {
  const currentToken = ensureAuth()
  if (!currentToken)
    return

  const ok = window.confirm('确认删除这个分类？分类下有商品会删不掉。')
  if (!ok)
    return

  loading.value = true
  errorMessage.value = null
  statusMessage.value = null
  try {
    await catalogService.deleteCategory(categoryId, currentToken)
    statusMessage.value = '分类删掉了。'
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
        分类库存
      </h1>
      <p class="text-sm text-neutral-500">
        分类维度统计商品数量与库存总量，支持搜索与分页。
      </p>
    </header>

    <section class="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <h2 class="text-lg font-semibold">
          新增分类
        </h2>
        <p v-if="!isAuthenticated" class="text-sm text-neutral-500">
          需要登录才能新增/修改/删除。
        </p>
      </div>

      <form class="grid gap-3 md:grid-cols-5" @submit.prevent="handleCreate">
        <label class="space-y-1 md:col-span-2">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">分类名称</span>
          <input
            v-model="createForm.category_name"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="必填"
            required
          >
        </label>

        <label class="space-y-1 md:col-span-3">
          <span class="text-xs uppercase tracking-[0.3em] text-neutral-400">描述</span>
          <input
            v-model="createForm.description"
            class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
            placeholder="选填"
          >
        </label>

        <div class="md:col-span-5 flex gap-2">
          <button
            type="submit"
            class="border border-neutral-900 rounded-md px-4 py-2 text-xs tracking-[0.3em] uppercase"
            :disabled="loading || !createForm.category_name.trim()"
          >
            {{ loading ? '提交中' : '添加分类' }}
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
            placeholder="分类名称"
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
              分类
            </th>
            <th class="px-4 py-3 text-left">
              描述
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
          <tr v-for="row in items" :key="row.category_id" class="border-t border-neutral-100">
            <td class="px-4 py-3 font-medium">
              <div v-if="editingId === row.category_id" class="space-y-2">
                <input
                  v-model="editForm.category_name"
                  class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
                  required
                >
              </div>
              <span v-else>
                {{ row.category_name }}
              </span>
            </td>
            <td class="px-4 py-3 text-neutral-600">
              <div v-if="editingId === row.category_id" class="space-y-2">
                <input
                  v-model="editForm.description"
                  class="w-full border border-neutral-900 rounded-md px-3 py-2 text-sm"
                  placeholder="选填"
                >
              </div>
              <span v-else>
                {{ row.description || '-' }}
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
                  v-if="editingId === row.category_id"
                  type="button"
                  class="border border-neutral-900 rounded-md px-3 py-1 text-xs uppercase"
                  :disabled="loading"
                  @click="handleUpdate"
                >
                  保存
                </button>
                <button
                  v-if="editingId === row.category_id"
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
                  v-if="editingId !== row.category_id"
                  type="button"
                  class="border border-red-200 rounded-md px-3 py-1 text-xs uppercase text-red-600"
                  :disabled="loading"
                  @click="handleDelete(row.category_id)"
                >
                  删除
                </button>
              </div>
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
