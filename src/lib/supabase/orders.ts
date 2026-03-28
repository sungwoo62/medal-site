import { createServerClient } from './server'

export type OrderStatus = '견적접수' | '시안작업' | '시안확인' | '제작중' | '납품완료'

export type Order = {
  id: string
  user_id: string | null
  quote_id: number | null
  event_name: string
  medal_type: string | null
  quantity: number
  desired_date: string | null
  note: string | null
  contact_name: string
  contact_phone: string
  contact_email: string | null
  status: OrderStatus
  total_amount: number | null
  site: string
  created_at: string
  updated_at: string
}

export type OrderFile = {
  id: string
  order_id: string
  file_type: '시안' | '견적서' | '세금계산서' | '참고파일' | '기타'
  file_name: string
  file_path: string
  uploaded_by: string
  created_at: string
}

export type TaxInvoice = {
  id: string
  order_id: string
  business_name: string
  business_number: string
  representative: string
  email: string
  status: '신청' | '발행완료' | '발행실패'
  issued_at: string | null
  created_at: string
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('medal_orders')
    .select('*')
    .eq('user_id', userId)
    .eq('site', 'medal-of-finisher')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Order[]
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('medal_orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error) return null
  return data as Order
}

export async function fetchOrderFiles(orderId: string): Promise<OrderFile[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('order_files')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as OrderFile[]
}

export async function fetchTaxInvoice(orderId: string): Promise<TaxInvoice | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('tax_invoices')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data as TaxInvoice
}

export async function createOrder(order: Partial<Order>): Promise<Order | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('medal_orders')
    .insert(order)
    .select()
    .single()

  if (error) return null
  return data as Order
}

// allpack-ops용
export async function fetchAllOrders(): Promise<Order[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('medal_orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Order[]
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('medal_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)

  return !error
}
