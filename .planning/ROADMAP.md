# Roadmap: Medal of Finisher

## Overview

현재 깨진 견적 폼을 고치는 것에서 시작해, 이메일 알림과 동적 갤러리까지 순서대로 완성한다. Phase 1이 핵심 버그를 수정하고 서버사이드 아키텍처를 확립하면, 나머지 Phase들이 그 위에 차례로 쌓인다. 모든 Phase는 allpack-ops와 공유하는 Supabase DB와의 호환성을 유지하면서 진행된다.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Quote Form Fix** - 견적 폼 "전송 실패" 버그 수정 및 Route Handler 마이그레이션
- [x] **Phase 2: Hero Image** - 히어로 섹션 배경 이미지 추가 및 반응형 적용 (completed 2026-03-26)
- [ ] **Phase 3: Email Notifications** - 견적 접수 시 고객 + 관리자 이메일 자동 발송
- [ ] **Phase 4: Dynamic Gallery** - 갤러리를 Supabase Storage 기반 동적 관리로 전환

## Phase Details

### Phase 1: Quote Form Fix
**Goal**: 고객이 견적 폼을 제출하면 Supabase에 정상 저장되고, DB 스키마가 allpack-ops와 호환된다
**Depends on**: Nothing (first phase)
**Requirements**: QUOTE-01, QUOTE-02, QUOTE-03, QUOTE-04, QUOTE-05, OPS-01, OPS-02, OPS-03
**Success Criteria** (what must be TRUE):
  1. 견적 폼을 제출하면 "전송 실패" 오류 없이 성공 메시지가 표시된다
  2. 제출된 견적이 Supabase quotes 테이블에 site='medal-of-finisher' 값과 함께 저장된다
  3. 파일 첨부 시 Supabase Storage attachments 버킷에 정상 업로드된다
  4. allpack-ops 관리자 대시보드에서 medal-site 견적을 조회할 수 있다
  5. 비로그인(익명) 사용자가 견적을 제출할 수 있다 (RLS INSERT 정책 허용)
**Plans**: 2 plans
Plans:
- [x] 01-01-PLAN.md — Server infrastructure: SQL migration, server Supabase client, Route Handler
- [ ] 01-02-PLAN.md — Form update: replace client-side insert with Route Handler fetch + smoke test
**UI hint**: yes

### Phase 2: Hero Image
**Goal**: 랜딩 페이지 히어로 섹션에 메달 제작 관련 배경 이미지가 반응형으로 표시된다
**Depends on**: Phase 1
**Requirements**: HERO-01, HERO-02
**Success Criteria** (what must be TRUE):
  1. 데스크톱에서 히어로 섹션 배경에 메달 이미지가 표시된다
  2. 모바일에서 히어로 섹션 배경 이미지가 적절하게 크롭/리사이즈되어 표시된다
**Plans**: 1 plan
Plans:
- [x] 02-01-PLAN.md — Source hero background image, place in /public/, verify responsive rendering
**UI hint**: yes

### Phase 3: Email Notifications
**Goal**: 견적 접수 즉시 고객은 접수 확인을, 관리자는 알림을 이메일로 받는다
**Depends on**: Phase 1
**Requirements**: EMAIL-01, EMAIL-02, EMAIL-03, EMAIL-04, EMAIL-05
**Success Criteria** (what must be TRUE):
  1. 견적 제출 후 고객 이메일 주소로 접수 확인 이메일이 도착한다
  2. 견적 제출 후 관리자 이메일로 알림 이메일이 도착하며 견적 요약이 포함된다
  3. 이메일에 이벤트명, 메달 종류, 수량, 연락처 정보가 포함된다
  4. 이메일 발송이 실패해도 견적 폼 제출은 성공으로 처리된다
**Plans**: 1 plan
Plans:
- [ ] 03-01-PLAN.md — Install nodemailer, create email module, integrate into quote Route Handler

### Phase 4: Dynamic Gallery
**Goal**: 갤러리 페이지가 하드코딩 데이터 대신 Supabase Storage에서 이미지를 동적으로 로드한다
**Depends on**: Phase 1
**Requirements**: GALLERY-01, GALLERY-02, GALLERY-03, GALLERY-04, GALLERY-05
**Success Criteria** (what must be TRUE):
  1. 갤러리 페이지 접속 시 Supabase에서 이미지 목록을 조회한다
  2. 카테고리 필터 클릭 시 해당 카테고리의 이미지만 표시된다
  3. 기존 12개 하드코딩 갤러리 항목이 Supabase에 마이그레이션되어 표시된다
  4. 갤러리 그리드 레이아웃이 모바일/데스크톱 모두에서 유지된다
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Quote Form Fix | 1/2 | In Progress|  |
| 2. Hero Image | 1/1 | Complete   | 2026-03-26 |
| 3. Email Notifications | 0/1 | Planned    |  |
| 4. Dynamic Gallery | 0/? | Not started | - |
