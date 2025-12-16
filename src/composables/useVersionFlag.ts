import { computed } from 'vue'

function resolveVersionFlag() {
  const env = import.meta.env as Record<string, string | undefined>
  const envVersion = env.VITE_VERSION ?? env.version ?? env.VERSION ?? ''

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

  return (storageVersion || envVersion).toLowerCase()
}

const versionFlag = resolveVersionFlag()

export function useVersionFlag() {
  const isLaiShenVersion = computed(() => versionFlag === 'ls')
  const brandName = computed(() => (isLaiShenVersion.value ? '来甚库存管理' : '帕神库存管理'))

  return {
    isLaiShenVersion,
    brandName,
  }
}
