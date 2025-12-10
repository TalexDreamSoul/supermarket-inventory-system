import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { ApiError } from '~/services/api-client'
import { authService, type LoginPayload, type RegisterPayload, type UserRole, type UserSummary } from '~/services/auth'

const accessToken = useStorage<string | null>('sis.access_token', null)
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const statusMessage = ref<string | null>(null)

function resetMessages() {
  errorMessage.value = null
  statusMessage.value = null
}

function ensureRole(role: string): role is UserRole {
  return ['admin', 'stock_operator', 'purchaser', 'cashier', 'finance', 'viewer'].includes(role)
}

async function execute<T>(operation: () => Promise<T>) {
  loading.value = true
  resetMessages()
  try {
    return await operation()
  }
  catch (error) {
    const message = error instanceof Error ? error.message : '接口又挂了。'
    errorMessage.value = message
    throw error
  }
  finally {
    loading.value = false
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(accessToken.value))

  async function login(payload: LoginPayload) {
    const response = await execute(() => authService.login(payload))
    accessToken.value = response.data.access_token
    statusMessage.value = '登录成功，token 已刷新。'
    return response.data
  }

  async function register(payload: RegisterPayload) {
    if (!ensureRole(payload.role))
      throw new ApiError('憨批角色别乱传。')

    const response = await execute(() => authService.register(payload))
    statusMessage.value = `用户 #${response.data.user_id} 创建好了。`
    return response.data
  }

  async function fetchUsers(): Promise<UserSummary[]> {
    if (!accessToken.value)
      throw new ApiError('没登录你查个屁用户列表。', { code: 401 })

    const response = await execute(() => authService.fetchUsers(accessToken.value!))
    statusMessage.value = `拉到 ${response.data.length} 个用户。`
    return response.data
  }

  function logout() {
    accessToken.value = null
    statusMessage.value = 'token 清空了，重新登录吧。'
  }

  return {
    token: accessToken,
    isAuthenticated,
    loading,
    errorMessage,
    statusMessage,
    login,
    register,
    fetchUsers,
    logout,
  }
}
