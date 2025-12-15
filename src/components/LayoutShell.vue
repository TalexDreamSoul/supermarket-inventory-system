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

const envVersion = (() => {
  const env = import.meta.env as Record<string, string | undefined>
  return env.VITE_VERSION ?? env.version ?? env.VERSION ?? ''
})()

const storageVersion = (() => {
  try {
    if (typeof localStorage === 'undefined')
      return ''
    return localStorage.getItem('version')
      ?? localStorage.getItem('VERSION')
      ?? localStorage.getItem('VITE_VERSION')
      ?? ''
  }
  catch {
    return ''
  }
})()

const versionFlag = (storageVersion || envVersion).toLowerCase()

const isLaiShenVersion = computed(() => versionFlag === 'ls')
const brandName = computed(() => (isLaiShenVersion.value ? '来甚库存管理' : '帕神库存管理'))

function handleLogout() {
  logout()
  router.replace('/auth/login')
}
</script>

<template>
  <div
    class="h-screen overflow-hidden flex flex-col font-sans"
    :class="isLaiShenVersion
      ? 'bg-[radial-gradient(circle_at_18%_18%,#fffaf3_0,#fff3e8_45%,#ffe9da_85%)] text-[#3b2a1d]'
      : 'bg-neutral-100 text-neutral-900'"
  >
    <header
      :class="isLaiShenVersion
        ? 'bg-[linear-gradient(120deg,#ffd9b3_0%,#ffc88c_50%,#ffb87a_100%)] text-[#3b1f0c] shadow-[0_14px_40px_-28px_rgba(255,184,122,0.45)] border-b border-[#ffd8aa]'
        : 'bg-white border-b border-neutral-200'"
    >
      <div
        class="px-6 py-4 flex items-center justify-between gap-4"
        :class="isLaiShenVersion ? 'backdrop-blur-sm' : ''"
      >
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <h1
            class="text-lg font-semibold tracking-wide flex-shrink-0"
            :class="isLaiShenVersion
              ? 'text-2xl font-black uppercase tracking-[0.2em] drop-shadow-sm text-[#8a490a]'
              : ''"
          >
            {{ brandName }}
          </h1>

          <div
            v-if="isLaiShenVersion && !isAuthRoute"
            class="flex items-center gap-2 flex-nowrap overflow-x-auto py-1 pl-1 pr-2 rounded-full border border-[#ffe8c7] bg-white/80 shadow-[0_10px_22px_-16px_rgba(255,184,122,0.45)] backdrop-blur"
            style="scrollbar-width: none;"
          >
            <RouterLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="px-3 py-2 text-xs font-semibold tracking-[0.14em] uppercase rounded-full transition-all duration-200 border whitespace-nowrap"
              :class="route.path === item.to
                ? 'bg-white text-[#b45a0a] border-[#ffc48d] shadow-[0_8px_22px_-16px_rgba(255,186,122,0.7)]'
                : 'text-[#5f3b1d] border-[#ffe1c0] hover:border-[#ffc48d] hover:bg-[#fff5ec]'"
            >
              {{ item.label }}
            </RouterLink>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <RouterLink
            v-if="!isAuthenticated && !isLoginRoute"
            class="rounded-md px-3 py-2 text-xs tracking-[0.3em] uppercase transition-all duration-200"
            :class="isLaiShenVersion
              ? 'border border-[#ffc48d] text-[#5f3b1d] bg-white/70 hover:bg-white shadow-[0_10px_26px_-18px_rgba(255,184,122,0.5)]'
              : 'border border-neutral-900 text-neutral-900 hover:bg-neutral-50'"
            to="/auth/login"
          >
            登录
          </RouterLink>
          <RouterLink
            v-if="!isRegisterRoute"
            class="rounded-md px-3 py-2 text-xs tracking-[0.3em] uppercase transition-all duration-200"
            :class="isLaiShenVersion
              ? 'border border-[#ffc48d] text-[#5f3b1d] bg-white/70 hover:bg-white shadow-[0_10px_26px_-18px_rgba(255,184,122,0.5)]'
              : 'border border-neutral-900 text-neutral-900 hover:bg-neutral-50'"
            to="/auth/register"
          >
            创建账号
          </RouterLink>
          <button
            v-if="isAuthenticated"
            type="button"
            class="rounded-md px-3 py-2 text-xs tracking-[0.3em] uppercase transition-all duration-200"
            :class="isLaiShenVersion
              ? 'border border-[#ffc48d] text-[#5f3b1d] bg-white/70 hover:bg-white shadow-[0_10px_26px_-18px_rgba(255,184,122,0.5)]'
              : 'border border-neutral-900 text-neutral-900 hover:bg-neutral-50'"
            @click="handleLogout"
          >
            退出
          </button>
        </div>
      </div>
    </header>

    <div v-if="isAuthRoute" class="flex flex-1 overflow-hidden">
      <main class="flex-1 overflow-hidden">
        <div
          class="h-full px-6 py-6"
          :class="isLaiShenVersion ? 'bg-white/70 backdrop-blur-sm' : ''"
        >
          <div
            class="h-full max-w-xl mx-auto w-full overflow-y-auto"
            :class="isLaiShenVersion ? 'bg-[radial-gradient(circle_at_25%_20%,#fffdf9_0,#fff4e8_42%,#ffe9d8_82%)] text-[#5f3b1d] backdrop-blur border border-[#ffe1c0] rounded-2xl shadow-[0_18px_55px_-32px_rgba(255,184,122,0.5)] p-6' : ''"
          >
            <slot />
          </div>
        </div>
      </main>
    </div>

    <div v-else>
      <template v-if="isLaiShenVersion">
        <main class="flex-1 overflow-hidden">
          <div class="h-full px-6 py-6">
            <div
              class="h-full max-w-7xl mx-auto w-full overflow-y-auto rounded-3xl border border-[#ffe1c0] bg-[radial-gradient(circle_at_12%_12%,#fffaf3_0,#fff2e8_40%,#ffe8d8_92%)] text-[#3b2a1d] backdrop-blur shadow-[0_24px_72px_-38px_rgba(255,184,122,0.5)] p-6"
            >
              <slot />
            </div>
          </div>
        </main>
      </template>

      <template v-else>
        <div class="flex flex-1 overflow-hidden">
          <aside class="w-64 px-5 py-6 flex flex-col gap-6 overflow-hidden bg-white border-r border-neutral-200">
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
                class="rounded-md px-3 py-2 text-sm font-medium tracking-[0.18em] uppercase transition-all duration-300"
                :class="route.path === item.to
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-100'"
              >
                {{ item.label }}
              </RouterLink>
            </nav>

            <section class="mt-auto text-xs text-neutral-500 border-t border-neutral-200 pt-4">
              <p class="text-neutral-400 tracking-[0.3em] uppercase">
                {{ brandName }}
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
      </template>
    </div>
  </div>
</template>
