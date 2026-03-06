# Convi DB 실행 체크리스트

Supabase SQL Editor 기준 실행 순서와 검증 쿼리입니다.

## 1) 실행 순서

아래 파일을 **순서대로** 실행하세요.

1. `01_init_schema.sql`
2. `02_rls_policies.sql`
3. `03_seed_data.sql`
4. `04_functions_and_triggers.sql`

## 2) 단계별 확인

### 1단계: 스키마 생성 확인

```sql
select count(*) as table_count
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE';
```

### 2단계: RLS 활성화 확인

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

### 3단계: 시드 데이터 확인

```sql
select count(*) as categories from public.categories;
select count(*) as stores from public.stores;
select count(*) as products from public.products;
select count(*) as coupons from public.coupons;
```

### 4단계: 트리거 생성 확인

```sql
select event_object_table as table_name, trigger_name
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name;
```

## 3) 기본 동작 점검

- `orders` INSERT 시 `order_number` 자동 생성
- `orders` 상태 변경 시 `order_status_history` 생성
- `orders.status = completed` 전환 시 재고 차감/포인트 적립
- `profiles.total_earned_points` 변경 시 등급(`loyalty_tier`) 갱신

## 4) 주의사항

- 운영 환경에서는 `03_seed_data.sql`의 샘플 데이터를 그대로 쓰지 마세요.
- 기존 데이터가 있는 DB에 재실행 시, PK/UNIQUE/RLS 정책 충돌 여부를 먼저 확인하세요.
- 대량 데이터 환경에서는 트리거 로직 성능을 사전 검증하세요.
