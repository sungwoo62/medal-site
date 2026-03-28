# medal-site

Medal of Finisher — 마라톤/스포츠 완주 메달 제작 전문 B2C 웹사이트.
고객이 메달 제작 견적을 신청하고, 갤러리에서 사례를 확인한다.

## Project Structure
```
src/
  app/
    page.tsx        — 랜딩 (히어로, 카테고리, 갤러리 발췌, CTA)
    quote/          — 견적 신청 폼
    gallery/        — 제작 사례 갤러리 (카테고리 필터)
    process/        — 제작 안내 (소재, 기법, 타임라인)
    api/            — Route Handlers (별도 CLAUDE.md 참고)
  components/       — Header, Footer, ScrollReveal
  lib/
    supabase/       — client.ts (브라우저), server.ts (service role)
    email.ts        — Resend 이메일 (고객 확인 + 관리자 알림)
```

## Key Dependencies
- `resend` — 이메일 발송 (Google Workspace SMTP 대체)

## UI Patterns
- 스크롤 애니메이션: `anim-fade-up`, `anim-scale-in` 등 (globals.css 정의)
- 애니메이션 딜레이: `anim-d1` ~ `anim-d4`
- 색상 팔레트: `text-rose`, `bg-charcoal`, `bg-warm-white`
- 그라데이션 매핑: `GRADIENTS` Record로 카테고리별 배경색
- 반응형: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- ScrollReveal: `.reveal` 클래스 → IntersectionObserver → `.visible` 추가

## Data Constants
페이지 상단에 `UPPER_SNAKE_CASE` 배열로 콘텐츠 정의 후 `.map()` 렌더링:
`CATEGORIES`, `PROCESS_STEPS`, `GALLERY_ITEMS`, `MEDAL_TYPES`, `TRUST_STATS` 등

## Quote Flow
1. 고객이 `/quote` 폼 작성 (클라이언트)
2. `POST /api/quote` → Supabase `quotes` 테이블 insert + 파일 업로드
3. Resend로 고객 확인 메일 + 관리자 알림 메일 (비차단, `Promise.allSettled`)
4. allpack-ops 대시보드에서 관리자가 견적 확인/처리

## SEO 최우선 원칙
- 모든 페이지 title, description 메타태그 필수
- Open Graph, Twitter Card 태그 포함
- 구조화 데이터(JSON-LD) 적용
- 페이지 로딩 속도 최적화 (Core Web Vitals)
- 시맨틱 HTML (h1 하나, h2/h3 계층 구조)
- 이미지 alt 태그 필수
- URL 구조 한국어 키워드 반영
- sitemap.xml, robots.txt 관리
