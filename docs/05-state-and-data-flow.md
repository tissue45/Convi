# 상태관리/데이터 흐름

## 상태관리 선택 기준

- **Zustand**: 도메인 상태(장바구니/주문/포인트/위시리스트)
- **React Query**: 서버 데이터 캐싱/동기화
- **Context**: 전역 UI 성격(토스트 등)

## 주요 스토어

- `src/stores/orderStore.ts`
  - 주문 조회/생성/구독
  - Realtime 이벤트 수신 후 목록 갱신
- `src/stores/cartStore.ts`
  - 장바구니 상태 관리
- `src/stores/pointStore.ts`
  - 포인트 관련 상태/연산
- `src/stores/wishlistStore.ts`
  - 찜 목록 관리

## 결제 데이터 흐름(요약)

1. Checkout에서 결제 요청 준비
2. 결제 SDK 실행
3. `/payment/success` 또는 `/payment/fail`로 이동
4. 성공 시 주문 생성/상태 반영

## 실시간 반영 포인트

- 주문/재고 화면에서 Supabase channel 구독
- 변경 이벤트 수신 시 화면 재조회 또는 상태 갱신

## 디버깅 팁

- 개발 중 Supabase 에러코드/메시지 로깅 확인
- 주문/재고 데이터는 역할별 권한 정책부터 점검
- 결제 후 중복 처리 방지 로직(키 기반)을 우선 확인
