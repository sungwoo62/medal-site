# Phase 1: Quote Form Fix - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 01-quote-form-fix
**Areas discussed:** Route Handler scope, Schema alignment

---

## Route Handler Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 1에서 전환 (Recommended) | Route Handler로 전환하면 Phase 3 이메일 발송이 자연스럽게 붙음. DB insert + email을 서버에서 처리. | ✓ |
| 클라이언트 유지 | 버그만 수정하고 Route Handler는 Phase 3에서 전환 | |
| You decide | Claude가 판단해서 최선 접근 | |

**User's choice:** Phase 1에서 전환 (Recommended)
**Notes:** Route Handler가 Phase 3 이메일 발송의 확장 포인트가 됨

---

## Schema Alignment

### allpack-ops 스키마 확인

| Option | Description | Selected |
|--------|-------------|----------|
| 있음 | allpack-ops에 이미 해당 컬럼들이 존재함 | |
| 없음 | allpack-ops에 없는 컬럼이고, 새로 추가 필요 | |
| 모르겠음 | allpack-ops DB를 확인해야 함 | ✓ |

**User's choice:** 모르겠음
**Notes:** Claude가 allpack-ops 코드베이스를 직접 확인. 결과: contact_email 컬럼 없음, desired_date는 valid_until로 이미 매핑됨.

### contact_email 컬럼 처리

| Option | Description | Selected |
|--------|-------------|----------|
| contact_email 컬럼 추가 (Recommended) | quotes 테이블에 nullable contact_email 컬럼 추가. Phase 3 이메일에 필수. | ✓ |
| note 패킹 유지 | note 필드에 '이메일: xxx' 형식으로 계속 저장 | |
| You decide | Claude가 판단 | |

**User's choice:** contact_email 컬럼 추가 (Recommended)
**Notes:** Phase 3 이메일 발송에 필수적인 별도 컬럼

---

## Claude's Discretion

- Error handling UX: 사용자가 선택하지 않음 — Claude 재량으로 결정
- Success feedback: 사용자가 선택하지 않음 — Claude 재량으로 결정

## Deferred Ideas

None — discussion stayed within phase scope
