import { computed, ref, watch } from 'vue'
import { dashboardService, type InventoryAlertItem, type InventoryReportOperation, type ProductListItem } from '~/services/dashboard'
import { useAuth } from './useAuth'

export interface DashboardStat {
  title: string
  value: string
  meta: string
}

export interface DashboardScheduleItem {
  time: string
  label: string
  detail: string
}

function formatTime(value: string) {
  try {
    const date = new Date(value)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  catch {
    return value
  }
}

function mapOperationToSchedule(op: InventoryReportOperation): DashboardScheduleItem {
  const labelMap: Record<string, string> = {
    in: '入库',
    out: '出库',
    adjust: '调整',
  }
  const label = labelMap[op.op_type] ?? '操作'
  return {
    time: formatTime(op.created_at),
    label: `${label} · 数量 ${op.quantity}`,
    detail: op.reason || `商品 #${op.product_id}`,
  }
}

function mapProduct(item: ProductListItem) {
  return {
    code: item.product_code,
    name: item.product_name,
    stock: item.stock ?? 0,
    min: item.min_stock ?? 0,
    status: item.status ?? '未知',
  }
}

function mapAlerts(alerts: InventoryAlertItem[], counts: { low: number, high: number, total: number }) {
  const topItems = alerts.slice(0, 3)
  const list = [
    { label: '低库存品类', value: String(counts.low), emphasis: true },
    { label: '高库存品类', value: String(counts.high), emphasis: true },
    { label: '告警总数', value: String(counts.total), emphasis: false },
  ]

  if (topItems.length) {
    topItems.forEach((item) => {
      list.push({
        label: `${item.product_name ?? '未知'} (${item.product_code ?? '-'})`,
        value: String(item.stock ?? 0),
        emphasis: true,
      })
    })
  }

  return list
}

export function useDashboard() {
  const { token } = useAuth()
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const stats = ref<DashboardStat[]>([])
  const products = ref<Array<ReturnType<typeof mapProduct>>>([])
  const alerts = ref<Array<{ label: string, value: string, emphasis: boolean }>>([])
  const schedule = ref<DashboardScheduleItem[]>([])

  async function refresh() {
    loading.value = true
    errorMessage.value = null
    const today = new Date().toISOString().slice(0, 10)
    const currentToken = token.value
    const warnings: string[] = []

    try {
      const [reportResult, alertResult, productResult] = await Promise.allSettled([
        dashboardService.fetchInventoryReport(today, currentToken),
        dashboardService.fetchInventoryAlerts(currentToken),
        dashboardService.fetchProducts({ page: 1, size: 5 }),
      ])

      if (reportResult.status === 'fulfilled') {
        const summary = reportResult.value.data.summary ?? { total_in: 0, total_out: 0, total_adjust: 0, total_products: 0 }
        stats.value = [
          { title: '今日入库', value: `+${summary.total_in ?? 0}`, meta: '单位：件' },
          { title: '今日出库', value: `-${summary.total_out ?? 0}`, meta: '单位：件' },
          { title: '调整操作', value: `${summary.total_adjust ?? 0}`, meta: '单位：件' },
        ]
        schedule.value = (reportResult.value.data.stock_operations ?? []).slice(0, 5).map(mapOperationToSchedule)
      }
      else {
        warnings.push('库存报表')
      }

      if (alertResult.status === 'fulfilled') {
        const payload = alertResult.value.data
        alerts.value = mapAlerts(payload.items || [], {
          low: payload.low_stock_count ?? 0,
          high: payload.high_stock_count ?? 0,
          total: payload.total_alerts ?? 0,
        })
      }
      else {
        warnings.push('库存预警')
      }

      if (productResult.status === 'fulfilled') {
        products.value = (productResult.value.data.items ?? []).slice(0, 5).map(mapProduct)
      }
      else {
        warnings.push('商品列表')
      }

      if (warnings.length)
        errorMessage.value = `${warnings.join('、')} 拉取失败，可以检查接口或登录状态。`
    }
    catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '仪表盘数据拉取失败。'
    }
    finally {
      loading.value = false
    }
  }

  watch(() => token.value, () => {
    refresh()
  }, { immediate: true })

  const hasData = computed(() => stats.value.length || products.value.length || alerts.value.length)

  return {
    stats,
    products,
    alerts,
    schedule,
    loading,
    errorMessage,
    hasData,
    refresh,
  }
}
