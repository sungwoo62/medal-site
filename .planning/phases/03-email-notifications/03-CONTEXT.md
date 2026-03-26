# Phase 3: Email Notifications - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

견적 접수 시 고객에게 접수 확인 이메일, 관리자에게 알림 이메일을 자동 발송한다. 기존 POST /api/quote Route Handler에 이메일 발송 로직을 추가한다. Google Workspace SMTP(nodemailer)를 사용하며, 이메일 발송 실패가 견적 제출 성공에 영향을 주지 않는다.

</domain>

<decisions>
## Implementation Decisions

### Sender & Recipients
- **D-01:** 발신 이메일 주소는 `hello@medaloffinisher.com` (Google Workspace 계정)
- **D-02:** 관리자 알림 수신 이메일도 `hello@medaloffinisher.com` (발신과 동일)
- **D-03:** Reply-To 헤더를 `hello@medaloffinisher.com`으로 설정 — 고객이 확인 이메일에 답장 가능

### SMTP Credentials
- **D-04:** 환경변수 네이밍: `SMTP_USER`, `SMTP_PASS` (Google Workspace App Password)
- **D-05:** Google Workspace App Password 사전 생성 필요 — 실행 전 확인 필요 (사용자 미확인 상태)
- **D-06:** `.env.local`에 `SMTP_USER=hello@medaloffinisher.com`, `SMTP_PASS=<app_password>` 추가

### Extension Point
- **D-07:** Phase 1에서 만든 POST `/api/quote` Route Handler에 이메일 발송 로직 추가 (Phase 1 D-03 이행)
- **D-08:** 이메일 발송은 Supabase insert 성공 후 실행, 실패해도 견적 제출은 성공 응답 반환 (EMAIL-05)

### Claude's Discretion
- Email content & tone: 이메일 본문 내용, 한국어 톤, HTML vs plain text 형식 — Claude 재량
- Failure handling strategy: SMTP 실패 시 로깅, 재시도 여부 — Claude 재량
- nodemailer 설정 세부사항 (connection pooling, timeout 등) — Claude 재량

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Route Handler (Extension Point)
- `src/app/api/quote/route.ts` — 현재 견적 저장 Route Handler. 이메일 로직 추가 지점 (Phase 1 D-03)

### Server Infrastructure
- `src/lib/supabase/server.ts` — 서버사이드 Supabase 클라이언트 패턴 (service role key 사용)

### Quote Form
- `src/app/quote/page.tsx` — 견적 폼 클라이언트 코드. contact_email 필드 포함

### Requirements
- `.planning/REQUIREMENTS.md` §Email Notifications — EMAIL-01~05 요구사항

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/api/quote/route.ts`: Route Handler — 이메일 발송 로직을 insert 성공 후에 추가
- `src/lib/supabase/server.ts`: 서버사이드 클라이언트 패턴 (env var 검증 포함)
- `contact_email` 필드가 이미 폼에서 수집되어 DB에 저장됨

### Established Patterns
- 서버사이드에서 `process.env` 환경변수 접근 (service role key 패턴)
- try/catch 에러 핸들링 with console.error 로깅
- NextResponse.json으로 JSON 응답 반환

### Integration Points
- `src/app/api/quote/route.ts`의 insert 성공 후 이메일 발송 코드 추가
- `.env.local`에 SMTP_USER, SMTP_PASS 환경변수 추가
- `package.json`에 nodemailer 의존성 추가

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-email-notifications*
*Context gathered: 2026-03-26*
