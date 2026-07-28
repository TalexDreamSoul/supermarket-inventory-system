import { apiRequest } from './api-client'

export interface ProductListItem {
  product_id: number
  product_code: string
  product_name: string
  category_id?: number | null
  category_name?: string | null
  supplier_id?: number | null
  supplier_name?: string | null
  purchase_price?: number | null
  sale_price?: number | null
  stock?: number | null
  min_stock?: number | null
  max_stock?: number | null
  storage_location?: string | null
  status?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ProductListResponse {
  items: ProductListItem[]
  total: number
  page: number
  size: number
}

type QueryParams = Record<string, string | number | null | undefined>

export type ProductQueryParams = QueryParams & {
  page?: number
  size?: number
  status?: string
  category_id?: number
  supplier_id?: number
  keyword?: string
}

export interface ProductPayload {
  product_code: string
  product_name: string
  category_id?: number | null
  supplier_id?: number | null
  purchase_price: number
  sale_price: number
  min_stock?: number | null
  max_stock?: number | null
  storage_location?: string | null
}

export type ProductUpdatePayload = Partial<ProductPayload> & {
  status?: string
}

export interface ProductIdentifier {
  product_id: number
}

export interface ProductDetail extends ProductListItem {
  created_by?: number | null
  updated_by?: number | null
  description?: string | null
}

export interface ProductStockSnapshot {
  product_id: number
  product_name: string
  stock: number
  min_stock: number
  max_stock: number
  status?: string | null
}

export interface ProductDeleteResult extends ProductIdentifier {
  message?: string
}

export const productService = {
  fetchProducts(params: ProductQueryParams = {}, token?: string | null) {
    return apiRequest<ProductListResponse>('/api/products', {
      method: 'GET',
      query: params,
      token: token ?? undefined,
    })
  },
  getProduct(productId: number, token?: string | null) {
    return apiRequest<ProductDetail>(`/api/products/${productId}`, {
      method: 'GET',
      token: token ?? undefined,
    })
  },
  getProductStock(productId: number, token?: string | null) {
    return apiRequest<ProductStockSnapshot>(`/api/products/${productId}/stock`, {
      method: 'GET',
      token: token ?? undefined,
    })
  },
  createProduct(token: string, payload: ProductPayload) {
    return apiRequest<ProductIdentifier>('/api/products', {
      method: 'POST',
      token,
      json: payload,
    })
  },
  updateProduct(productId: number, token: string, payload: ProductUpdatePayload) {
    return apiRequest<ProductDetail>(`/api/products/${productId}`, {
      method: 'PUT',
      token,
      json: payload,
    })
  },
  deleteProduct(productId: number, token: string) {
    return apiRequest<ProductDeleteResult>(`/api/products/${productId}`, {
      method: 'DELETE',
      token,
    })
  },
}
