-- medal-of-finisher 사이트는 allpack-ops의 quotes 테이블을 공유합니다.
-- site 컬럼에 'medal-of-finisher' 값을 넣어 구분합니다.
--
-- quotes 테이블이 이미 존재한다면 아래 RLS 정책만 추가하세요.
-- (anon 사용자의 INSERT 허용)

-- quotes 테이블에 site 컬럼이 없으면 추가
alter table quotes add column if not exists site text;

-- contact_email 컬럼 추가 (nullable — allpack-ops 역호환, OPS-03)
alter table quotes add column if not exists contact_email text;

-- anon INSERT 허용 (사이트 견적 폼용)
create policy if not exists "Anon can insert quotes"
  on quotes for insert to anon with check (true);
