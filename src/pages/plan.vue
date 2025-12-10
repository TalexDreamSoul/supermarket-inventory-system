<script setup lang="ts">
import apiPlan from '../../API_PLAN.md?raw'

defineOptions({
  name: 'PlanPage',
})
</script>

<template>
  <section class="max-w-6xl mx-auto text-left space-y-6">
    <header class="space-y-2">
      <p class="text-xs uppercase tracking-[0.3em] text-neutral-500">
        DOCUMENT
      </p>
      <h1 class="text-3xl font-semibold">
        API 工作计划
      </h1>
      <p class="text-sm text-neutral-500">
        以下内容实时读取 <code>API_PLAN.md</code>，保持与文档同步。
      </p>
    </header>

    <article class="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
      <pre class="whitespace-pre-wrap leading-relaxed text-sm text-neutral-800">
{{ apiPlan }}
      </pre>
    </article>
  </section>
</template>
