-- 메달 사이트 견적 신청 테이블
-- Supabase SQL Editor에서 실행하세요

create table if not exists site_quotes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  event_name text not null,
  medal_type text not null default '기타',
  quantity int,
  desired_date date,
  note text,
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  file_url text,
  file_name text,
  status text default 'new' check (status in ('new', 'contacted', 'quoted', 'confirmed', 'rejected'))
);

create index if not exists idx_site_quotes_created on site_quotes (created_at desc);
create index if not exists idx_site_quotes_status on site_quotes (status);

alter table site_quotes enable row level security;

create policy "Anyone can insert site_quotes"
  on site_quotes for insert to anon, authenticated with check (true);

create policy "Authenticated users can select site_quotes"
  on site_quotes for select to authenticated using (true);

create policy "Authenticated users can update site_quotes"
  on site_quotes for update to authenticated using (true) with check (true);
