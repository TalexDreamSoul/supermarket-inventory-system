const sanitizedBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

if (!sanitizedBaseUrl && import.meta.env.DEV)
  console.warn('艹，VITE_API_BASE_URL 没配，接口全都 404。')

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export class ApiError extends Error {
  code: number
  status: number
  details?: unknown

  constructor(message: string, options: { code?: number, status?: number, details?: unknown } = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = options.code ?? 500
    this.status = options.status ?? 500
    this.details = options.details
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  method?: HttpMethod
  token?: string | null
  query?: Record<string, string | number | null | undefined>
  json?: unknown
}

function buildUrl(path: string, query?: Record<string, string | number | null | undefined>) {
  if (!sanitizedBaseUrl)
    throw new ApiError('后端地址没配，赶紧把 VITE_API_BASE_URL 写好。', { code: 500 })

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${sanitizedBaseUrl}${normalizedPath}`)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '')
        return
      url.searchParams.set(key, String(value))
    })
  }

  return url.toString()
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { method = 'GET', token, query, json, headers, ...rest } = options

  const finalHeaders = new Headers({
    Accept: 'application/json',
    ...headers,
  })

  const init: RequestInit = {
    method,
    ...rest,
    headers: finalHeaders,
  }

  if (token)
    finalHeaders.set('Authorization', `Bearer ${token}`)

  if (json !== undefined) {
    finalHeaders.set('Content-Type', 'application/json')
    init.body = JSON.stringify(json)
  }

  const response = await fetch(buildUrl(path, query), init)
  const rawText = await response.text()

  let payload: ApiResponse<T> | undefined
  if (rawText) {
    try {
      payload = JSON.parse(rawText) as ApiResponse<T>
    }
    catch (cause) {
      throw new ApiError('后端回了个垃圾 JSON，解析不了。', {
        status: response.status,
        details: {
          raw: rawText,
          cause,
        },
      })
    }
  }

  if (!response.ok || !payload) {
    throw new ApiError(payload?.message ?? response.statusText ?? '请求直接黄了。', {
      code: payload?.code ?? response.status,
      status: response.status,
      details: payload ?? rawText,
    })
  }

  if (payload.code !== 0) {
    throw new ApiError(payload.message || '接口自己报错了。', {
      code: payload.code,
      status: response.status,
      details: payload,
    })
  }

  return payload
}
