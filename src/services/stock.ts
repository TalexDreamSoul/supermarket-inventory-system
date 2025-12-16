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

export interface StockMutationResult {
  operation_id: number
}

interface StockBasePayload {
  product_id: number
  reason?: string | null
  unit_price?: number | string | null
  order_id?: number | string | null
}

export interface StockInPayload extends StockBasePayload {
  quantity: number
}

export interface StockOutPayload extends StockBasePayload {
  quantity: number
}

export interface StockAdjustPayload {
  product_id: number
  new_stock: number
  reason?: string | null
  notes?: string | null
}

export const stockService = {
  fetchOperations(token: string, params: StockOperationQueryParams = {}) {
    return apiRequest<PaginatedResponse<StockOperationItem>>('/api/stock/operations', {
      method: 'GET',
      token,
      query: params,
    })
  },
  fetchOperationDetail(token: string, operationId: number) {
    return apiRequest<StockOperationItem>(`/api/stock/operations/${operationId}`, {
      method: 'GET',
      token,
    })
  },
  stockIn(token: string, payload: StockInPayload) {
    return apiRequest<StockMutationResult>('/api/stock/in', {
      method: 'POST',
      token,
      json: payload,
    })
  },
  stockOut(token: string, payload: StockOutPayload) {
    return apiRequest<StockMutationResult>('/api/stock/out', {
      method: 'POST',
      token,
      json: payload,
    })
  },
  adjustStock(token: string, payload: StockAdjustPayload) {
    return apiRequest<StockMutationResult>('/api/stock/adjust', {
      method: 'POST',
      token,
      json: payload,
    })
  },
}
