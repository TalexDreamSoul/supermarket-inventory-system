import { apiRequest } from './api-client'

export type OrderType = 'purchase' | 'sale' | 'return' | 'transfer'
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'

export interface OrderListItem {
  order_id: string
  order_type: OrderType
  status?: OrderStatus | null
  total_amount?: number
  created_at?: string | null
  updated_at?: string | null
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}

type QueryParams = Record<string, string | number | null | undefined>

export type OrderQueryParams = QueryParams & {
  page?: number
  size?: number
  keyword?: string
  order_type?: OrderType
  status?: OrderStatus
  start_date?: string
  end_date?: string
}

export const orderService = {
  fetchOrders(token: string, params: OrderQueryParams = {}) {
    return apiRequest<PaginatedResponse<OrderListItem>>('/api/orders', {
      method: 'GET',
      token,
      query: params,
    })
  },
}
