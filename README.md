# 요즘픽

쿠팡 상품과 트렌드 출처를 소개하는 반응형 큐레이션 사이트입니다.
**배포 대상은 Vercel이며 표준 Next.js 16 App Router를 사용합니다.**
Cloudflare Workers, D1, Vinext 및 Sites 인증은 사용하지 않습니다.

## 실행

Node.js 24.x를 사용합니다. Vercel에서도 Node.js 24.x를 선택하세요.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm start
```

개발 화면: http://127.0.0.1:5173/ · 운영자: /admin
Windows에서는 start-preview.cmd로도 열 수 있습니다.

## 배포와 관리자 연결

[버셀 배포 안내](docs/VERCEL.md)에 설정 메뉴와 연결 순서를 정리했습니다.
환경변수를 등록하지 않아도 기본 상품 18개의 방문자 페이지를 배포할 수 있습니다.
온라인 관리자 로그인과 영구 저장에는 별도의 Supabase 프로젝트 연결이 필요합니다.

개발 환경에서는 .local/content.sqlite에 저장합니다. 이 파일은 공개 서버로 전송하지 않습니다.
배포 환경에서 로컬 체험 로그인은 사용할 수 없습니다.

## 주요 구성

- app/, components/: 방문자 화면, 관리자 편집, 서버 요청 처리
- lib/content-store.ts: 초안·공개본 저장 및 동시 편집 충돌 검사
- lib/admin-auth.ts, lib/supabase-server.ts, proxy.ts: 운영자 인증과 세션
- lib/local-content.ts: 로컬 개발용 SQLite 저장소
- db/supabase-setup.sql: 전용 Supabase 저장 테이블과 접근 권한
- data/products.json: 기본 상품 18개
- vercel.json, next.config.ts: Vercel 및 Next.js 빌드 설정
- tests/: 상품 규칙과 저장·로그인 경계 검증
- docs/HANDOFF.md: 화면 사용 방법과 쿠팡 파트너스 검토 기록

상품 사진은 사용권 확인 전 공란으로 표시하며, 기존 상품 설명·출처·링크를 유지합니다.
실제 제휴 링크와 수수료 안내 표시 규칙도 유지합니다.
