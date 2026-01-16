# 🏪 편의점 종합 솔루션 v2.0

**완전히 작동하는 상용 수준의 편의점 통합 관리 플랫폼 (100% 완성)**

편의점 비즈니스를 위한 완전한 디지털 생태계입니다. 고객, 점주, 본사가 실시간으로 연결되어 주문부터 재고 관리, 매출 분석까지 모든 비즈니스 프로세스를 자동화합니다.

## 🚀 프로젝트 문서 인덱스 (Documentation)

상세한 매뉴얼 및 기술 명세는 아래 문서들을 참조하세요.

- [프로젝트 개요 (Overview)](file:///c:/convi/convi/docs/PROJECT_OVERVIEW.md)
- [배포 가이드 (Deployment)](file:///c:/convi/convi/docs/DEPLOYMENT_GUIDE.md)
- [데이터베이스 스키마 (DB Schema)](file:///c:/convi/convi/docs/database/SCHEMA.md)
- [데이터베이스 관계도 (DB ERD)](file:///c:/convi/convi/docs/database/ERD.md)
- [API 요약 (API Overview)](file:///c:/convi/convi/docs/api/API_OVERVIEW.md)

---

## 🚀 핵심 기능

### 👤 고객 (Customer)
- ✅ **실시간 지점 선택** - GPS 기반 주변 지점 검색
- ✅ **완전한 주문 시스템** - 장바구니 → 결제 → 추적
- ✅ **토스페이먼츠 연동** - 카드, 간편결제 지원
- ✅ **실시간 주문 추적** - 준비중 → 완료 단계별 알림
- ✅ **개인화된 대시보드** - 맞춤 추천 및 통계

### 🏪 점주 (Store Owner)
- ✅ **실시간 주문 관리** - 신규 주문 즉시 알림 및 처리
- ✅ **스마트 재고 관리** - 자동 재고 차감 및 부족 알림
- ✅ **매출 분석 대시보드** - 일/주/월 매출, 인기 상품 분석
- ✅ **본사 물류 요청** - 원클릭 재고 발주 시스템
- ✅ **엑셀 리포트** - 공급 및 반품 내역 엑셀 다운로드 (서명 포함)

### 🏢 본사 (HQ)
- ✅ **통합 지점 관리** - 전국 지점 실시간 모니터링
- ✅ **상품 마스터 관리** - 카테고리별 상품 등록 및 관리
- ✅ **물류 승인 시스템** - 지점 발주 요청 승인/거부
- ✅ **전사 매출 분석** - 지점별, 상품별 매출 통계

## 🛠️ 기술 스택

### Frontend
- **React 19** - 최신 React 기능 활용
- **TypeScript 5.x** - 완전한 타입 안전성
- **Vite 7** - 초고속 빌드 및 개발 환경
- **React Router 7** - 최신 라우팅 시스템
- **Zustand** - 초경량 상태 관리
- **Tailwind CSS 3.4** - 유틸리티 기반 디자인
- **TanStack Query v5** - 서버 상태 관리 및 캐싱

### Backend & Database
- **Supabase** - PostgreSQL + Auth + Realtime + Storage
- **PostgreSQL 15** - 고성능 DB & PostGIS (공간 데이터)
- **Row Level Security (RLS)** - 강력한 데이터 보안 정책
- **Database Functions & Triggers** - 30개 이상의 자동화 로직 구현

### 외부 서비스
- **토스페이먼츠** - 결제 시스템 완전 연동
- **네이버 Geocoding API** - 주소 기반 좌표 변환 서비스 (Proxy 구현)
- **Google Maps API** - 지도 시각화

---

## 🚀 빠른 시작 (Quick Start)

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 정보를 입력하세요 (비밀번호/키 포함 금지):
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TOSS_CLIENT_KEY=your_toss_key
VITE_NAVER_CLIENT_ID=your_naver_id
VITE_NAVER_CLIENT_SECRET=your_naver_secret
```

### 3. 데이터베이스 초기 설정
Supabase SQL Editor에서 다음 파일들을 순서대로 실행하세요:
1. `init_schema.sql` - 테이블 및 RLS 보안 설정
2. `init_logic.sql` - 함수 및 트리거 (비즈니스 로직)
3. `seed_data.sql` - 초기 카테고리 및 테스트 데이터

### 4. 개발 서버 실행
```bash
npm run dev
```

---

## 🏗️ 프로젝트 구조

```
src/
├── components/          # 공통 및 역할별 UI 컴포넌트
├── pages/              # 고객/점주/본사 페이지 컴포넌트
├── stores/             # Zustand를 이용한 전역 상태 관리
├── hooks/              # 비즈니스 로직 분리를 위한 커스텀 훅
├── lib/                # Supabase 등 라이브러리 설정
├── types/              # TypeScript 인터페이스 및 타입 정의
└── utils/              # 포맷팅, 유효성 검사 등 공통 유틸리티

docs/                   # 상세 프로젝트 문서화 파일들
```

---

## 🚀 배포 정보 (Deployment)

### 빌드 및 로컬 테스트
```bash
npm run build
node server.js   # 프록시 서버 및 정적 파일 서빙 실행
```

### Render.com 배포 가이드
1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `node server.js`
3. **포트 설정**: 전용 포트(기본 3001 또는 `PORT` 환경변수) 사용

- **Proxy 기능**: 네이버 Geocoding API 호출 시 발생하는 CORS 문제를 해결하기 위해 `server.js`에 내장된 프록시 서버가 작동합니다.

---

## 🧪 테스트 계정 정보
- **고객**: customer1@test.com / test123
- **점주**: owner1@test.com / test123  
- **본사**: hq@test.com / test123

---

**편의점 종합 솔루션 v2.0** | 개발팀
