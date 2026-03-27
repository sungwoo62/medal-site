-- gallery_items 테이블 생성 및 초기 데이터 삽입
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL,
  year text NOT NULL,
  description text NOT NULL,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- 익명 사용자 SELECT 허용 (갤러리 공개 조회)
CREATE POLICY "gallery_items_select_anon" ON gallery_items
  FOR SELECT TO anon USING (true);

-- 서비스 롤 전체 권한 (관리자 allpack-ops에서 관리)
CREATE POLICY "gallery_items_all_service" ON gallery_items
  FOR ALL TO service_role USING (true);

-- 초기 데이터 삽입 (12개 갤러리 항목)
INSERT INTO gallery_items (title, category, year, description, display_order, is_featured) VALUES
('서울국제마라톤 완주메달', '마라톤', '2024', '금도금 다이캐스팅, 리본 포함 1,200개', 1, true),
('전국체육대회 금메달', '체육대회', '2024', '순금 도금, 고급 케이스 포함 300개', 2, true),
('기업 우수사원 시상패', '시상식', '2024', '아크릴+금속 복합소재, 레이저 각인 50개', 3, true),
('창립 30주년 기념메달', '기업행사', '2024', '순은 도금, 한정판 시리얼 넘버 500개', 4, true),
('부산 해변마라톤 메달', '마라톤', '2024', '앤틱실버 도금, 커스텀 리본 2,000개', 5, true),
('전국 수영대회 메달세트', '체육대회', '2023', '금/은/동 3종, 각 100개', 6, true),
('올해의 교사상 시상메달', '시상식', '2023', '고급 금도금, 벨벳 케이스 30개', 7, false),
('스타트업 해커톤 메달', '기업행사', '2023', '무광 블랙+골드 2톤, 200개', 8, false),
('춘천마라톤 기념메달', '마라톤', '2023', '풀컬러 에폭시, 3,000개 대량 제작', 9, false),
('도민체전 종합우승 메달', '체육대회', '2023', '프리미엄 금도금, 150개', 10, false),
('봉사 공로상 메달', '시상식', '2023', '앤틱골드, 나무 케이스 포함 80개', 11, false),
('연말 시상식 메달세트', '기업행사', '2023', '다이캐스팅+에나멜, 금/은/동 각 50개', 12, false);
