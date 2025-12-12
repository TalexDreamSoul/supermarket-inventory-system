import { apiRequest } from './api-client'

export interface CategoryListItem {
  category_id: number
  category_name: string
  description?: string | null
  product_count?: number
  total_stock?: number
  created_at?: string | null
  updated_at?: string | null
}

export interface SupplierListItem {
  supplier_id: number
  supplier_name: string
  contact_person?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  product_count?: number
  total_stock?: number
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

export type CatalogQueryParams = QueryParams & {
  page?: number
  size?: number
  keyword?: string
}

export const catalogService = {
  fetchCategories(params: CatalogQueryParams = {}) {
    return apiRequest<PaginatedResponse<CategoryListItem>>('/api/categories', {
      method: 'GET',
      query: params,
    })
  },
  fetchSuppliers(params: CatalogQueryParams = {}) {
    return apiRequest<PaginatedResponse<SupplierListItem>>('/api/suppliers', {
      method: 'GET',
      query: params,
    })
  },
}
