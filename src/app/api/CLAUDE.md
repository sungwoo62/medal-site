# API Routes

## Server-side Supabase
모든 route에서 `createServerClient()` 사용 (service role key). API route에서만 service role 사용 — 클라이언트 컴포넌트는 anon key.

## Routes
- `POST /api/quote` — 견적 접수. FormData 파싱 → Storage 업로드 → DB insert → 이메일 발송
- `GET /api/secure/files?path=...` — Supabase Storage signed URL 생성 후 redirect (1시간 유효)

## Error Pattern
- 필수값 누락: 400 + `{ error: '...' }`
- DB/업로드 실패: 500 + `{ error: '...' }`
- 이메일 실패: 무시 (Promise.allSettled) — 견적 접수 성공 응답은 보장

## 파일 업로드
Storage 경로: `quote-files/{timestamp}.{ext}` — 타임스탬프 기반 유니크 네이밍
