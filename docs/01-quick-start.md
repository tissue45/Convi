# 빠른 시작 가이드

## 1) 요구 사항

- Node.js 18+
- npm 9+
- Supabase 프로젝트
- (선택) 네이버 Geocoding API 키

## 2) 설치

```bash
npm install
```

## 3) 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_TOSS_CLIENT_KEY=your_toss_client_key
VITE_NAVER_CLIENT_ID=your_naver_client_id
VITE_NAVER_CLIENT_SECRET=your_naver_client_secret
```

## 4) 실행

프론트엔드만 실행:

```bash
npm run dev
```

프론트 + Express 서버 동시 실행:

```bash
npm run dev:full
```

## 5) 빌드/미리보기

```bash
npm run build
npm run preview
```

## 6) 첫 확인 포인트

- `/` 랜딩 페이지 진입 확인
- `/auth` 인증 페이지 진입 확인
- `/customer`, `/store`, `/hq` 라우팅 접근 확인
- `/health` 헬스체크 응답 확인(서버 실행 시)
