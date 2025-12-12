<script setup lang="ts">
import type { UserSummary } from '~/services/auth'
import { computed, reactive, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

defineOptions({
  name: 'AuthLoginPage',
})

const { login, fetchUsers, token, loading, errorMessage, statusMessage, isAuthenticated, logout } = useAuth()
const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

const form = reactive({
  username: '',
  password: '',
})

const users = ref<UserSummary[]>([])
const userLoading = ref(false)
const userError = ref<string | null>(null)

const maskedToken = computed(() => {
  if (!token.value)
    return '未登录'
  return token.value.length > 16 ? `${token.value.slice(0, 16)}...` : token.value
})

async function handleLogin() {
  try {
    await login({
      username: form.username.trim(),
      password: form.password,
    })
  }
  catch {
    // useAuth 已经把 errorMessage 写好了，这里别再把错误往外炸。
  }
}

async function loadUsers() {
  userError.value = null
  userLoading.value = true
  try {
    users.value = await fetchUsers()
  }
  catch (error) {
    userError.value = error instanceof Error ? error.message : '用户列表没拉下来。'
  }
  finally {
    userLoading.value = false
  }
}
</script>

<template>
  <section class="mx-auto text-left max-w-3xl space-y-6">
    <header class="space-y-2">
      <p class="text-xs uppercase tracking-widest text-neutral-500">
        api base: <code>{{ backendBaseUrl || '未配置' }}</code>
      </p>
      <h1 class="text-3xl font-semibold">
        登录 · 帕神库存管理
      </h1>
      <p class="text-sm text-neutral-500">
        接入统一认证体系，调接口前记得配置 token。
      </p>
    </header>

    <form class="space-y-5 border border-neutral-200 rounded-xl bg-white px-6 py-6" @submit.prevent="handleLogin">
      <label class="block space-y-1">
        <span>用户名</span>
        <input
          v-model="form.username"
          type="text"
          required
          autocomplete="username"
          class="px-4 py-3 border border-neutral-900 rounded bg-white w-full focus:(outline-none ring-2 ring-neutral-900)"
        >
      </label>

      <label class="block space-y-1">
        <span>密码</span>
        <input
          v-model="form.password"
          type="password"
          required
          autocomplete="current-password"
          class="px-4 py-3 border border-neutral-900 rounded bg-white w-full focus:(outline-none ring-2 ring-neutral-900)"
        >
      </label>

      <button
        type="submit"
        class="text-sm px-5 py-3 border border-neutral-900 rounded-md tracking-[0.3em] uppercase"
        :disabled="loading || !form.username || !form.password"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>

    <p v-if="errorMessage" class="text-neutral-700">
      {{ errorMessage }}
    </p>
    <p v-if="statusMessage" class="text-neutral-500">
      {{ statusMessage }}
    </p>

    <div class="p-5 border border-neutral-200 rounded-xl bg-white space-y-3">
      <p>
        当前 Token: <code>{{ maskedToken }}</code>
      </p>
      <div class="flex gap-2">
        <button
          class="text-xs px-3 py-2 border border-neutral-900 rounded tracking-[0.3em] uppercase"
          type="button"
          :disabled="!isAuthenticated"
          @click="loadUsers"
        >
          {{ userLoading ? '拉取中...' : '获取用户列表' }}
        </button>
        <button
          class="text-xs px-3 py-2 border border-neutral-900 rounded tracking-[0.3em] uppercase"
          type="button"
          :disabled="!isAuthenticated"
          @click="logout"
        >
          退出登录
        </button>
      </div>
      <p v-if="userError" class="text-sm text-neutral-700">
        {{ userError }}
      </p>
    </div>

    <div v-if="users.length" class="space-y-2">
      <h2 class="font-semibold">
        用户列表
      </h2>
      <div class="border border-neutral-200 rounded overflow-auto bg-white">
        <table class="text-sm w-full">
          <thead>
            <tr class="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-widest">
              <th class="px-3 py-2 text-left">
                ID
              </th>
              <th class="px-3 py-2 text-left">
                用户名
              </th>
              <th class="px-3 py-2 text-left">
                角色
              </th>
              <th class="px-3 py-2 text-left">
                创建时间
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.user_id" class="border-t border-gray-100 dark:border-gray-800">
              <td class="px-3 py-2">
                {{ user.user_id }}
              </td>
              <td class="px-3 py-2">
                {{ user.username }}
              </td>
              <td class="px-3 py-2 capitalize">
                {{ user.role }}
              </td>
              <td class="px-3 py-2">
                {{ user.created_at }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <RouterLink class="text-sm text-neutral-600 underline underline-offset-4" to="/auth/register">
      没账号？先去注册
    </RouterLink>
  </section>
</template>
