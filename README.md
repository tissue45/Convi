# Convi (편의점 종합 솔루션)

고객, 점주, 본사 역할을 분리해 운영하는 편의점 통합 웹 애플리케이션입니다.  
React + TypeScript + Supabase 기반으로 주문/재고/물류/분석/환불 흐름을 제공합니다.

## 문서 센터

상세 가이드는 아래 문서에서 확인할 수 있습니다.

- [빠른 시작 가이드](./docs/01-quick-start.md)
- [아키텍처 개요](./docs/02-architecture.md)
- [라우팅/권한 가이드](./docs/03-routing-and-roles.md)
- [환경변수/서버 설정](./docs/04-env-and-server.md)
- [상태관리/데이터 흐름](./docs/05-state-and-data-flow.md)
- [운영 체크리스트](./docs/06-operations-checklist.md)

## 데이터베이스 문서

- [DB 스키마 생성 SQL](./db/01_init_schema.sql)
- [RLS 정책 SQL](./db/02_rls_policies.sql)
- [기본 시드 데이터 SQL](./db/03_seed_data.sql)
- [함수/트리거 SQL](./db/04_functions_and_triggers.sql)
- [DB 실행 체크리스트](./db/RUNBOOK.md)

## 기술 스택

- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- State/Data: Zustand, React Query
- Backend/DB: Supabase (PostgreSQL, Realtime, RLS)
- Payment: Toss Payments
- Server: Express, CORS, node-fetch, dotenv (Geocoding 프록시)

## 주요 기능

- 고객: 상품 탐색, 장바구니, 주문/결제, 주문 추적, 환불
- 점주: 주문 처리, 재고 관리, 물류 요청, 매출/재고 분석
- 본사: 지점/상품/회원 관리, 물류 승인, 통합 분석
- 공통: 인증/권한 분리, 실시간 업데이트, 고객지원/FAQ/QA

## 프로젝트 실행

### 1) 의존성 설치

```bash
npm install
```

### 2) 환경 변수 설정

루트에 `.env` 파일을 생성하고 값을 설정하세요.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TOSS_CLIENT_KEY=your_toss_client_key
VITE_NAVER_CLIENT_ID=your_naver_client_id
VITE_NAVER_CLIENT_SECRET=your_naver_client_secret
```

### 3) 개발 서버 실행

- 프론트만 실행:

```bash
npm run dev
```

- 프론트 + 프록시 서버 동시 실행:

```bash
npm run dev:full
```

## 스크립트

- `npm run dev`: Vite 개발 서버
- `npm run server`: Express 프록시 서버
- `npm run dev:full`: 프론트 + 서버 동시 실행
- `npm run build`: 프로덕션 빌드
- `npm run preview`: 빌드 미리보기
- `npm run lint`: ESLint 검사
- `npm run production`: 빌드 후 서버 실행

## 주요 라우트

- `/` 랜딩
- `/auth` 인증
- `/customer/*` 고객 앱
- `/store/*` 점주 앱
- `/hq/*` 본사 앱
- `/payment/success`, `/payment/fail` 결제 결과
- `/support/*` 지원 페이지
- `/manual/*` 사용자 매뉴얼 페이지

## 참고

- `server.js`는 네이버 Geocoding API 프록시와 정적 파일 서빙을 담당합니다.
- 배포 환경에서는 민감 키를 코드에 두지 말고 환경 변수로만 관리하세요.
