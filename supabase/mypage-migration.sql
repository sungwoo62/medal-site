-- 마이페이지용 테이블: medal_orders, order_files, tax_invoices

-- 주문 테이블
CREATE TABLE IF NOT EXISTS medal_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  quote_id bigint,
  event_name text NOT NULL,
  medal_type text,
  quantity int DEFAULT 1,
  desired_date date,
  note text,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text,
  status text DEFAULT '견적접수' CHECK (status IN ('견적접수','시안작업','시안확인','제작중','납품완료')),
  total_amount int,
  site text DEFAULT 'medal-of-finisher',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 주문 파일 테이블 (시안, 견적서 PDF 등)
CREATE TABLE IF NOT EXISTS order_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES medal_orders(id) ON DELETE CASCADE NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('시안','견적서','세금계산서','참고파일','기타')),
  file_name text NOT NULL,
  file_path text NOT NULL,
  uploaded_by text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- 세금계산서 발행 테이블
CREATE TABLE IF NOT EXISTS tax_invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES medal_orders(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  business_number text NOT NULL,
  representative text NOT NULL,
  email text NOT NULL,
  status text DEFAULT '신청' CHECK (status IN ('신청','발행완료','발행실패')),
  issued_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS 정책
ALTER TABLE medal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_invoices ENABLE ROW LEVEL SECURITY;

-- medal_orders: 본인 주문만 조회 (anon은 불가)
CREATE POLICY "Users can view own medal_orders" ON medal_orders
  FOR SELECT USING (auth.uid() = user_id);

-- medal_orders: service role은 모든 작업 가능
CREATE POLICY "Service role full access on medal_orders" ON medal_orders
  FOR ALL USING (auth.role() = 'service_role');

-- order_files: 본인 주문의 파일만 조회
CREATE POLICY "Users can view own order files" ON order_files
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM medal_orders WHERE medal_orders.id = order_files.order_id AND medal_orders.user_id = auth.uid())
  );

CREATE POLICY "Service role full access on order_files" ON order_files
  FOR ALL USING (auth.role() = 'service_role');

-- tax_invoices: 본인 주문의 세금계산서만 조회/생성
CREATE POLICY "Users can view own tax invoices" ON tax_invoices
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM medal_orders WHERE medal_orders.id = tax_invoices.order_id AND medal_orders.user_id = auth.uid())
  );

CREATE POLICY "Users can request tax invoice" ON tax_invoices
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM medal_orders WHERE medal_orders.id = tax_invoices.order_id AND medal_orders.user_id = auth.uid())
  );

CREATE POLICY "Service role full access on tax_invoices" ON tax_invoices
  FOR ALL USING (auth.role() = 'service_role');

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_medal_orders_user_id ON medal_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_medal_orders_status ON medal_orders(status);
CREATE INDEX IF NOT EXISTS idx_order_files_order_id ON order_files(order_id);
CREATE INDEX IF NOT EXISTS idx_tax_invoices_order_id ON tax_invoices(order_id);
