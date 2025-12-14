<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const navItems = [
  { label: '仪表盘总览', to: '/' },
  { label: '库存查询', to: '/products' },
  { label: '库存审计', to: '/audit' },
  { label: '分类库存', to: '/categories' },
  { label: '供应商', to: '/suppliers' },
  { label: '订单管理', to: '/orders' },
]

const route = useRoute()
const router = useRouter()
const { isAuthenticated, logout } = useAuth()

const isAuthRoute = computed(() => route.path.startsWith('/auth/'))
const isLoginRoute = computed(() => route.path === '/auth/login')
const isRegisterRoute = computed(() => route.path === '/auth/register')

function handleLogout() {
  logout()
  router.replace('/auth/login')
}
</script>

<template>
  <div class="h-screen overflow-hidden flex flex-col bg-neutral-100 text-neutral-900 font-sans">
    <header class="bg-white border-b border-neutral-200">
      <div class="px-6 py-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold tracking-wide">
          帕神库存管理
        </h1>

        <div class="flex items-center gap-2">
          <RouterLink
            v-if="!isAuthenticated && !isLoginRoute"
            class="border border-neutral-900 rounded-md px-3 py-2 text-xs tracking-[0.3em] uppercase"
            to="/auth/login"
          >
            登录
          </RouterLink>
          <RouterLink
            v-if="!isRegisterRoute"
            class="border border-neutral-900 rounded-md px-3 py-2 text-xs tracking-[0.3em] uppercase"
            to="/auth/register"
          >
            创建账号
          </RouterLink>
          <button
            v-if="isAuthenticated"
            type="button"
            class="border border-neutral-900 rounded-md px-3 py-2 text-xs tracking-[0.3em] uppercase"
            @click="handleLogout"
          >
            退出
          </button>
        </div>
      </div>
    </header>

    <div v-if="isAuthRoute" class="flex flex-1 overflow-hidden">
      <main class="flex-1 overflow-hidden">
        <div class="h-full px-6 py-6">
          <div class="h-full max-w-xl mx-auto w-full overflow-y-auto">
            <slot />
          </div>
        </div>
      </main>
    </div>

    <div v-else class="flex flex-1 overflow-hidden">
      <aside class="w-64 bg-white border-r border-neutral-200 px-5 py-6 flex flex-col gap-6 overflow-hidden">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-neutral-400">
            导航
          </p>
          <h2 class="text-lg font-semibold">
            模块入口
          </h2>
        </div>

        <nav class="flex flex-col gap-1 overflow-y-auto min-h-0">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="rounded-md px-3 py-2 text-sm font-medium tracking-[0.18em] uppercase transition-colors duration-200"
            :class="route.path === item.to
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-500 hover:bg-neutral-100'"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <section class="mt-auto text-xs text-neutral-500 border-t border-neutral-200 pt-4">
          <p class="text-neutral-400 tracking-[0.3em] uppercase">
            帕神库存管理
          </p>
        </section>
      </aside>

      <main class="flex-1 overflow-hidden">
        <div class="h-full px-6 py-6">
          <div class="h-full max-w-6xl mx-auto w-full overflow-y-auto">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
