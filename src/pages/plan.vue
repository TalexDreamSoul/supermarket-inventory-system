<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'LegacyPlanRedirect',
})

const router = useRouter()

onMounted(() => {
  router.replace('/')
})
</script>

<template>
  <div />
</template>
