import { apiRequest } from './api-client'

export type StockOperationType = 'in' | 'out' | 'adjust' | 'transfer'

export interface StockOperationItem {
  op_id: number
  product_id: number
  product_code?: string | null
  product_name?: string | null
  op_type: StockOperationType
  quantity: number
  stock_before: number
  stock_after: number
  unit_price?: number | null
  total_price?: number | null
  operation_date?: string | null
  created_at?: string | null
  operator_id?: number
  operator_action?: string | null
  order_id?: string | null
  reason?: string | null
  notes?: string | null
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}

type QueryParams = Record<string, string | number | null | undefined>

export type StockOperationQueryParams = QueryParams & {
  page?: number
  size?: number
  product_id?: number
  type?: StockOperationType
  keyword?: string
  start_date?: string
  end_date?: string
}

export const stockService = {
  fetchOperations(token: string, params: StockOperationQueryParams = {}) {
    return apiRequest<PaginatedResponse<StockOperationItem>>('/api/stock/operations', {
      method: 'GET',
      token,
      query: params,
    })
  },
}
