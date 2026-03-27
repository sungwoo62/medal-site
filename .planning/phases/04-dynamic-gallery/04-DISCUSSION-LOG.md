# Phase 4: Dynamic Gallery - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 04-dynamic-gallery
**Areas discussed:** Data model, Image handling, Data fetching, Migration strategy

---

## Data model

| Option | Description | Selected |
|--------|-------------|----------|
| 현재 4개 + image_url | title, category, year, description, image_url — 최소한 | |
| 확장 필드 추가 | 4개 + image_url + display_order, is_featured, created_at | ✓ |
| You decide | Claude 재량으로 최적 스키마 결정 | |

**User's choice:** 확장 필드 추가
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| 읽기 전용 | medal-site는 DB에서 조회만. 관리는 allpack-ops에서 별도 구현 | |
| allpack-ops 관리 포함 | allpack-ops에 갤러리 CRUD UI도 이번 phase에 포함 | ✓ |
| SQL + seed만 | DB 테이블 + 초기 데이터만. 관리 UI는 나중에 | |

**User's choice:** allpack-ops 관리 포함
**Notes:** None

---

## Image handling

| Option | Description | Selected |
|--------|-------------|----------|
| Public bucket | Supabase Storage public 버킷 — 이미지 URL이 공개 | |
| Signed URL 프록시 | 기존 /api/secure/files 패턴 재활용 — private 버킷 + signed URL | ✓ |
| You decide | Claude 재량 | |

**User's choice:** Signed URL 프록시
**Notes:** Phase 1에서 구현된 기존 패턴 재활용

| Option | Description | Selected |
|--------|-------------|----------|
| 현재 그라데이션 유지 | 이미지 없으면 카테고리별 그라데이션 + Award 아이콘 | |
| 플레이스홀더 이미지 | 기본 플레이스홀더 이미지 표시 | |
| You decide | Claude 재량 | ✓ |

**User's choice:** You decide
**Notes:** None

---

## Data fetching

| Option | Description | Selected |
|--------|-------------|----------|
| SSR + 클라이언트 필터 | 서버에서 전체 데이터 fetch → 클라이언트에서 필터링 | |
| 클라이언트 전체 | 'use client'에서 useEffect로 Supabase fetch | |
| You decide | Claude 재량으로 최적 방식 결정 | ✓ |

**User's choice:** You decide
**Notes:** None

---

## Migration strategy

| Option | Description | Selected |
|--------|-------------|----------|
| SQL seed 스크립트 | ITEMS 배열을 INSERT SQL로 변환. 이미지 없이 데이터만 | ✓ |
| 데이터 + 더미 이미지 | SQL seed + Storage에 더미/샘플 이미지도 업로드 | |
| You decide | Claude 재량 | |

**User's choice:** SQL seed 스크립트
**Notes:** 이미지는 allpack-ops에서 나중에 업로드

---

## Claude's Discretion

- Image fallback UI (이미지 없는 항목 표시)
- Data fetching 전략 (SSR vs CSR)
- allpack-ops 갤러리 관리 UI/UX 세부사항
- RLS 정책 설정

## Deferred Ideas

- GALLERY-06: next/image 최적화 (blur placeholder) — v2
