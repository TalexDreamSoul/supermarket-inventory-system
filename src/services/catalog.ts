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

export interface CategoryPayload {
  category_name: string
  description?: string | null
}

export interface SupplierPayload {
  supplier_name: string
  contact_person?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
}

export const catalogService = {
  fetchCategories(params: CatalogQueryParams = {}) {
    return apiRequest<PaginatedResponse<CategoryListItem>>('/api/categories', {
      method: 'GET',
      query: params,
    })
  },
  createCategory(token: string, payload: CategoryPayload) {
    return apiRequest<CategoryListItem>('/api/categories', {
      method: 'POST',
      token,
      json: payload,
    })
  },
  updateCategory(categoryId: number, token: string, payload: CategoryPayload) {
    return apiRequest<CategoryListItem>(`/api/categories/${categoryId}`, {
      method: 'PUT',
      token,
      json: payload,
    })
  },
  deleteCategory(categoryId: number, token: string) {
    return apiRequest<{ category_id: number }>(`/api/categories/${categoryId}`, {
      method: 'DELETE',
      token,
    })
  },
  fetchSuppliers(params: CatalogQueryParams = {}) {
    return apiRequest<PaginatedResponse<SupplierListItem>>('/api/suppliers', {
      method: 'GET',
      query: params,
    })
  },
  createSupplier(token: string, payload: SupplierPayload) {
    return apiRequest<SupplierListItem>('/api/suppliers', {
      method: 'POST',
      token,
      json: payload,
    })
  },
  updateSupplier(supplierId: number, token: string, payload: SupplierPayload) {
    return apiRequest<SupplierListItem>(`/api/suppliers/${supplierId}`, {
      method: 'PUT',
      token,
      json: payload,
    })
  },
  deleteSupplier(supplierId: number, token: string) {
    return apiRequest<{ supplier_id: number }>(`/api/suppliers/${supplierId}`, {
      method: 'DELETE',
      token,
    })
  },
}
