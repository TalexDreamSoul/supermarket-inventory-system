<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const navItems = [
  { label: '仪表盘总览', to: '/' },
  { label: '库存查询', to: '/products' },
  { label: '库存审计', to: '/audit' },
  { label: '分类库存', to: '/categories' },
  { label: '供应商', to: '/suppliers' },
  { label: '订单管理', to: '/orders' },
  { label: '用户登录', to: '/auth/login' },
  { label: '创建账号', to: '/auth/register' },
  { label: '系统检查', to: '/plan' },
]

const backendBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
const todayLabel = computed(() => new Date().toLocaleDateString('zh-CN'))
const route = useRoute()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-neutral-100 text-neutral-900 font-sans">
    <header class="bg-neutral-900 text-white px-8 py-5 shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.4em] text-neutral-400">
            PSM / CMS
          </p>
          <h1 class="text-2xl font-semibold">
            帕神库存管理
          </h1>
          <p class="text-sm text-neutral-400">
            运营后台 · 黑白无干扰
          </p>
        </div>
        <div class="text-xs text-neutral-300 text-right leading-relaxed">
          <p>接口：{{ backendBaseUrl || '未配置' }}</p>
          <p>更新日期：{{ todayLabel }}</p>
          <p>状态：库存巡检进行中</p>
        </div>
      </div>
    </header>

    <div class="flex flex-1">
      <aside class="w-64 bg-white border-r border-neutral-200 px-5 py-6 flex flex-col gap-6">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-neutral-400">
            导航
          </p>
          <h2 class="text-lg font-semibold">
            模块入口
          </h2>
        </div>

        <nav class="flex flex-col gap-1">
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

        <section class="mt-auto space-y-2 text-xs text-neutral-500 border-t border-neutral-200 pt-4">
          <p>版本：CMS 黑白 · 设计稿 0.2</p>
          <p>状态：接口以实际返回为准</p>
        </section>
      </aside>

      <main class="flex-1 px-8 py-8">
        <div class="max-w-6xl mx-auto w-full">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
