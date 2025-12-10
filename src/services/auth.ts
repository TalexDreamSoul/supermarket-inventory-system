import { apiRequest } from './api-client'

export type UserRole = 'admin' | 'stock_operator' | 'purchaser' | 'cashier' | 'finance' | 'viewer'

export interface UserSummary {
  user_id: number
  username: string
  role: UserRole
  created_at: string
}

export interface RegisterPayload {
  username: string
  password: string
  role: UserRole
}

export interface LoginPayload {
  username: string
  password: string
}

export interface UpdateUserPayload {
  password?: string
  role?: UserRole
}

export interface LoginResponse {
  access_token: string
}

export interface RegisterResponse {
  user_id: number
}

export const authService = {
  register(payload: RegisterPayload) {
    return apiRequest<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      json: payload,
    })
  },
  login(payload: LoginPayload) {
    return apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      json: payload,
    })
  },
  fetchUsers(token: string) {
    return apiRequest<UserSummary[]>('/api/auth/users', {
      method: 'GET',
      token,
    })
  },
  fetchUser(userId: number, token: string) {
    return apiRequest<UserSummary>(`/api/auth/users/${userId}`, {
      method: 'GET',
      token,
    })
  },
  updateUser(userId: number, payload: UpdateUserPayload, token: string) {
    return apiRequest<UserSummary>(`/api/auth/users/${userId}`, {
      method: 'PUT',
      json: payload,
      token,
    })
  },
  deleteUser(userId: number, token: string) {
    return apiRequest<{ user_id: number }>(`/api/auth/users/${userId}`, {
      method: 'DELETE',
      token,
    })
  },
}
