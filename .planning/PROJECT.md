# Medal of Finisher

## What This Is

Medal of Finisher는 마라톤/스포츠 완주 메달 제작 전문 업체의 B2C 웹사이트다. 고객이 메달 제작 견적을 신청하고, 갤러리에서 제작 사례를 확인하며, 마이페이지에서 견적 현황을 추적할 수 있다. 관리자는 별도 프로젝트(allpack-ops)에서 견적을 관리하며, 같은 Supabase DB를 공유한다.

## Core Value

고객이 메달 제작 견적을 쉽고 빠르게 신청하고, 접수 상태를 확인할 수 있어야 한다.

## Requirements

### Validated

- ✓ 반응형 랜딩 페이지 (히어로, 제품 카테고리, 제작 과정, 신뢰 지표) — existing
- ✓ 견적 신청 폼 UI (이벤트명, 메달 종류, 수량, 연락처, 파일 첨부) — existing
- ✓ 갤러리 페이지 UI (카테고리별 메달 사례 그리드) — existing
- ✓ 제작 과정 안내 페이지 — existing
- ✓ Supabase quotes 테이블 연동 (allpack-ops와 공유, site 컬럼으로 구분) — existing
- ✓ 파일 첨부 업로드 (Supabase Storage attachments 버킷) — existing

### Active

- ✓ 견적 폼 Supabase 저장 오류 수정 ("전송 실패" 오류 해결) — Validated in Phase 1: Quote Form Fix
- ✓ 히어로 섹션 배경 이미지 추가 — Validated in Phase 2: Hero Image
- [ ] 갤러리 이미지를 Supabase Storage로 관리 (하드코딩 → 동적)
- [ ] 견적 접수시 이메일 자동 발송 (고객 접수 확인 + 관리자 알림)
- [ ] 마이페이지: 이메일/비밀번호 로그인 (Supabase Auth)
- [ ] 마이페이지: 고객 견적 현황 확인
- [ ] allpack-ops 관리자 대시보드와 DB 연동 (같은 Supabase 프로젝트 공유)

### Out of Scope

- 결제/주문 시스템 — 견적 기반 비즈니스, 온라인 결제 불필요
- 실시간 채팅 — 전화/이메일로 충분
- 다국어 지원 — 한국 시장 전용
- OAuth 소셜 로그인 — 이메일/비밀번호로 충분
- 모바일 앱 — 웹 반응형으로 충분

## Context

- **기존 코드베이스:** Next.js 16 + React 19 + Tailwind CSS 4 + Supabase. 프론트엔드 UI 완성 상태.
- **Supabase 공유:** medal-site와 allpack-ops가 같은 Supabase 프로젝트를 사용. quotes 테이블의 `site` 컬럼('medal-of-finisher')으로 데이터 구분.
- **견적 폼 오류:** 현재 폼 제출 시 "전송 실패" 오류 발생. 원인 미파악 — 스키마 불일치, RLS 정책, 또는 환경변수 문제 가능성.
- **갤러리 현황:** 현재 하드코딩된 더미 데이터. Supabase Storage + DB로 동적 관리 필요.
- **이메일 발송:** Google Workspace SMTP 사용 (기존 도메인 이메일). 고객 접수 확인 + 관리자 알림 양방향.
- **allpack-ops:** ~/allpack-ops 경로의 별도 프로젝트. 관리자 대시보드로 견적 관리. 같은 Supabase DB 공유.

## Constraints

- **Tech Stack**: Next.js 16 + Supabase — 기존 스택 유지
- **Email**: Google Workspace SMTP — 기존 도메인 이메일 활용
- **DB 공유**: allpack-ops와 같은 Supabase 프로젝트 — quotes 테이블 스키마 변경 시 양쪽 호환 필수
- **인증**: Supabase Auth (이메일/비밀번호) — 고객 마이페이지용

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase DB 공유 (medal-site + allpack-ops) | 관리자가 하나의 대시보드에서 모든 견적 관리 | — Pending |
| Google Workspace SMTP for email | 기존 도메인 이메일 인프라 활용 | — Pending |
| Supabase Auth (이메일/비밀번호) | 고객 마이페이지 접근용, 간단한 인증 | — Pending |
| Supabase Storage for gallery | 관리자가 동적으로 갤러리 이미지 관리 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-26 after Phase 2 completion*
