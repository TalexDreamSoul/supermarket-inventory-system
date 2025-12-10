import { apiRequest } from './api-client'

export interface InventoryAlertItem {
  product_id?: number
  product_name?: string
  product_code?: string
  stock?: number
  min_stock?: number
  max_stock?: number
  status?: string
}

export interface InventoryAlertsResponse {
  low_stock_count: number
  high_stock_count: number
  total_alerts: number
  items: InventoryAlertItem[]
}

export interface InventoryReportSummary {
  total_products: number
  total_in: number
  total_out: number
  total_adjust: number
}

export interface InventoryReportOperation {
  op_id: number
  product_id: number
  op_type: 'in' | 'out' | 'adjust'
  quantity: number
  created_at: string
  reason?: string
  order_id?: string
}

export interface InventoryReportResponse {
  report_date: string
  summary: InventoryReportSummary
  stock_summary: Array<{
    product_id: number
    stock: number
  }>
  stock_operations: InventoryReportOperation[]
}

export interface ProductListItem {
  product_id: number
  product_code: string
  product_name: string
  stock?: number
  min_stock?: number
  status?: string
}

export interface ProductListResponse {
  items: ProductListItem[]
  total: number
  page: number
  size: number
}

export const dashboardService = {
  fetchInventoryAlerts(token?: string | null) {
    return apiRequest<InventoryAlertsResponse>('/api/reports/inventory_alerts', {
      method: 'GET',
      token: token ?? undefined,
    })
  },
  fetchInventoryReport(date: string, token?: string | null) {
    return apiRequest<InventoryReportResponse>('/api/reports/inventory_report', {
      method: 'GET',
      query: { date },
      token: token ?? undefined,
    })
  },
  fetchProducts(params: { page?: number, size?: number, status?: string } = {}) {
    return apiRequest<ProductListResponse>('/api/products', {
      method: 'GET',
      query: params,
    })
  },
}
