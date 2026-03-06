# 라우팅/권한 가이드

`src/App.tsx` 기준 라우팅 구조입니다.

## 공개 라우트

- `/` : 랜딩
- `/auth` : 로그인/회원가입
- `/payment/success`, `/payment/fail`
- `/support/*`, `/company/*`, `/manual/*`

## 고객 영역

- 베이스: `/customer`
- 주요: `home`, `store`, `products`, `cart`, `checkout`, `orders`, `profile`, `refunds`

## 점주 영역

- 베이스: `/store`
- 보호: `allowedRoles=['store_owner']`
- 주요: `dashboard`, `orders`, `inventory`, `supply`, `analytics`, `refunds`

## 본사 영역

- 베이스: `/hq`
- 보호: `allowedRoles=['headquarters', 'hq_admin']`
- 주요: `dashboard`, `stores`, `products`, `members`, `supply`, `analytics`

## 권한 점검 체크리스트

- 미인증 사용자의 보호 라우트 접근 차단
- 점주 계정으로 `/hq` 진입 불가 확인
- 본사 계정으로 `/store` 진입 정책 확인
- 역할 전환 시 라우트 접근 권한 갱신 확인
