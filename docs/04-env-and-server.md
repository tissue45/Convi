# 환경변수/서버 설정

## 필수 환경변수

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 기능별 환경변수

- 결제: `VITE_TOSS_CLIENT_KEY`
- 지오코딩:
  - `VITE_NAVER_CLIENT_ID`
  - `VITE_NAVER_CLIENT_SECRET`
  - 또는 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`

## Express 서버(`server.js`) 역할

- `/api/geocode` 프록시 엔드포인트 제공
- `/health` 헬스체크 제공
- `dist` 정적 파일 서빙

## 실행 명령

- 로컬 서버: `npm run server`
- 로컬 프로덕션 스타일 서버: `npm run serve:local`
- 배포용 시작: `npm run start`

## 문제 해결

- `401` Geocoding 오류: API 키 누락 여부 확인
- `CORS` 오류: `server.js`의 허용 origin 확인
- 정적 파일 미서빙: `npm run build` 후 `node server.js` 실행 여부 확인
