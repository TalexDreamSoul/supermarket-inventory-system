<script setup lang="ts">
import type { UserRole } from '~/services/auth'
import { reactive } from 'vue'
import { useAuth } from '~/composables/useAuth'

defineOptions({
  name: 'AuthRegisterPage',
})

const { register, loading, errorMessage, statusMessage } = useAuth()

const roles: UserRole[] = ['admin', 'stock_operator', 'purchaser', 'cashier', 'finance', 'viewer']

const form = reactive({
  username: '',
  password: '',
  role: 'viewer' as UserRole,
})

async function handleRegister() {
  try {
    await register({
      username: form.username.trim(),
      password: form.password,
      role: form.role,
    })
  }
  catch {
    // useAuth 已经把 errorMessage 写好了，这里别再把错误往外炸。
  }
}
</script>

<template>
  <section class="mx-auto text-left max-w-3xl space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-semibold">
        注册 · 帕神库存管理
      </h1>
      <p class="text-sm text-neutral-500">
        只录入文档中要求的字段，保持账号信息规范。
      </p>
    </header>

    <form class="space-y-5 border border-neutral-200 rounded-xl bg-white px-6 py-6" @submit.prevent="handleRegister">
      <label class="block space-y-1">
        <span>用户名</span>
        <input
          v-model="form.username"
          type="text"
          required
          autocomplete="off"
          class="px-4 py-3 border border-neutral-900 rounded bg-white w-full focus:(outline-none ring-2 ring-neutral-900)"
        >
      </label>

      <label class="block space-y-1">
        <span>密码</span>
        <input
          v-model="form.password"
          type="password"
          required
          autocomplete="new-password"
          class="px-4 py-3 border border-neutral-900 rounded bg-white w-full focus:(outline-none ring-2 ring-neutral-900)"
        >
      </label>

      <label class="block space-y-1">
        <span>角色</span>
        <select
          v-model="form.role"
          class="px-4 py-3 border border-neutral-900 rounded bg-white w-full focus:(outline-none ring-2 ring-neutral-900)"
        >
          <option
            v-for="role in roles"
            :key="role"
            :value="role"
            class="text-neutral-900 bg-white"
          >
            {{ role }}
          </option>
        </select>
      </label>

      <button
        type="submit"
        class="text-sm px-5 py-3 border border-neutral-900 rounded-md tracking-[0.3em] uppercase"
        :disabled="loading || !form.username || !form.password"
      >
        {{ loading ? '创建中...' : '创建用户' }}
      </button>
    </form>

    <p v-if="errorMessage" class="text-neutral-700">
      {{ errorMessage }}
    </p>
    <p v-if="statusMessage" class="text-neutral-500">
      {{ statusMessage }}
    </p>

    <RouterLink class="text-sm text-neutral-600 underline underline-offset-4" to="/auth/login">
      已有账号？直接登录
    </RouterLink>
  </section>
</template>
