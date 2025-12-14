<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

defineOptions({
  name: 'AuthLoginPage',
})

const { login, loading, errorMessage, statusMessage } = useAuth()
const route = useRoute()
const router = useRouter()

const form = reactive({
  username: '',
  password: '',
})

async function handleLogin() {
  try {
    await login({
      username: form.username.trim(),
      password: form.password,
    })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    await router.replace(redirect.startsWith('/') ? redirect : '/')
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
        登录
      </h1>
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
  </section>
</template>
