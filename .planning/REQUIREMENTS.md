# Requirements: Medal of Finisher

**Defined:** 2026-03-26
**Core Value:** 고객이 메달 제작 견적을 쉽고 빠르게 신청하고, 접수 상태를 확인할 수 있어야 한다.

## v1 Requirements

Requirements for current milestone. Each maps to roadmap phases.

### Quote Form

- [x] **QUOTE-01**: 견적 폼 제출이 Supabase quotes 테이블에 성공적으로 저장된다
- [x] **QUOTE-02**: 폼 필드가 allpack-ops quotes 테이블 스키마와 정확히 일치한다
- [x] **QUOTE-03**: RLS 정책이 익명 사용자의 INSERT를 허용한다
- [x] **QUOTE-04**: 견적 제출이 서버사이드 Route Handler를 통해 처리된다
- [ ] **QUOTE-05**: 파일 첨부 업로드가 Supabase Storage에 정상 저장된다

### Hero Image

- [x] **HERO-01**: 히어로 섹션에 메달 제작 관련 배경 이미지가 표시된다
- [x] **HERO-02**: 배경 이미지가 모바일/데스크톱에서 반응형으로 표시된다

### Gallery

- [x] **GALLERY-01**: 갤러리 이미지가 Supabase Storage에서 동적으로 로드된다
- [x] **GALLERY-02**: gallery_items 테이블에서 이미지 메타데이터를 조회한다
- [x] **GALLERY-03**: 카테고리별 필터 기능이 동적 데이터에서도 작동한다
- [x] **GALLERY-04**: 기존 하드코딩된 갤러리 항목이 Supabase로 마이그레이션된다
- [x] **GALLERY-05**: 반응형 그리드 레이아웃이 유지된다

### Email Notifications

- [x] **EMAIL-01**: 견적 접수 시 고객에게 접수 확인 이메일이 발송된다
- [x] **EMAIL-02**: 견적 접수 시 관리자에게 알림 이메일이 발송된다
- [x] **EMAIL-03**: 이메일에 견적 요약 (이벤트명, 메달 종류, 수량, 연락처)이 포함된다
- [x] **EMAIL-04**: Google Workspace SMTP를 통해 이메일이 발송된다
- [x] **EMAIL-05**: 이메일 발송 실패가 견적 폼 제출 성공에 영향을 주지 않는다

### allpack-ops Integration

- [x] **OPS-01**: medal-site와 allpack-ops가 같은 Supabase quotes 테이블을 공유한다
- [x] **OPS-02**: quotes 테이블의 site 컬럼으로 medal-of-finisher 데이터를 구분한다
- [x] **OPS-03**: DB 스키마 변경이 allpack-ops와 역호환된다 (nullable columns)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Customer Portal (마이페이지)

- **PORTAL-01**: 이메일/비밀번호 회원가입 + 로그인 (Supabase Auth)
- **PORTAL-02**: 내 견적 목록 조회
- **PORTAL-03**: 견적 상세 보기 (제출 내용 + 상태)
- **PORTAL-04**: 로그아웃
- **PORTAL-05**: 비로그인 시 마이페이지 리다이렉트

### Email Enhancements

- **EMAIL-06**: 견적 상태 변경 시 고객에게 알림 이메일 발송

### Gallery Enhancements

- **GALLERY-06**: next/image 최적화 (blur placeholder)

### Portal Differentiators

- **PORTAL-06**: 견적 번호로 비로그인 조회
- **PORTAL-07**: 기존 견적에 파일 추가 첨부

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| 결제/주문 시스템 | 견적 기반 비즈니스, 온라인 결제 불필요 |
| 실시간 채팅 | 전화/이메일로 충분 |
| 다국어 지원 | 한국 시장 전용 |
| OAuth 소셜 로그인 | v2 마이페이지에서도 이메일/비밀번호로 충분 |
| 모바일 앱 | 웹 반응형으로 충분 |
| 갤러리 관리 UI (medal-site 내) | allpack-ops에서 관리, medal-site는 읽기 전용 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| QUOTE-01 | Phase 1 | Complete |
| QUOTE-02 | Phase 1 | Complete |
| QUOTE-03 | Phase 1 | Complete |
| QUOTE-04 | Phase 1 | Complete |
| QUOTE-05 | Phase 1 | Pending |
| HERO-01 | Phase 2 | Complete |
| HERO-02 | Phase 2 | Complete |
| GALLERY-01 | Phase 4 | Complete |
| GALLERY-02 | Phase 4 | Complete |
| GALLERY-03 | Phase 4 | Complete |
| GALLERY-04 | Phase 4 | Complete |
| GALLERY-05 | Phase 4 | Complete |
| EMAIL-01 | Phase 3 | Complete |
| EMAIL-02 | Phase 3 | Complete |
| EMAIL-03 | Phase 3 | Complete |
| EMAIL-04 | Phase 3 | Complete |
| EMAIL-05 | Phase 3 | Complete |
| OPS-01 | Phase 1 | Complete |
| OPS-02 | Phase 1 | Complete |
| OPS-03 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0

---
*Requirements defined: 2026-03-26*
*Last updated: 2026-03-26 after roadmap creation*
