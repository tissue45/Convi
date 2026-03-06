# 아키텍처 개요

## 전체 구성

- **Client**: React + TypeScript + Vite
- **Data/Auth**: Supabase
- **State**: Zustand + React Query
- **Server**: Express (`server.js`) - Geocoding 프록시 + 정적 파일 서빙

## 디렉터리 요약

- `src/pages`: 도메인별 페이지
  - `customer`, `store`, `hq`, `payment`, `support`, `manual`, `company`
- `src/components`: 공통/역할별 UI
- `src/stores`: Zustand 스토어(`orderStore`, `cartStore`, `pointStore`, `wishlistStore`)
- `src/lib`: Supabase/결제/지오코딩/재고 유틸
- `src/hooks`: 분석/검증/공통 훅
- `src/contexts`: 토스트 컨텍스트

## 런타임 흐름

1. `src/main.tsx`에서 앱 부트스트랩
2. `src/App.tsx`에서 역할별 라우팅 구성
3. 인증/권한 체크 후 역할별 레이아웃 진입
4. 페이지에서 Supabase 조회/수정 + Realtime 구독

## 기술 포인트

- 역할 기반 라우팅 보호(`ProtectedRoute`)
- 결제 성공/실패 페이지 분리
- 재고/주문 도메인에서 실시간 반영 사용
- Express 서버로 외부 API 프록시 처리
