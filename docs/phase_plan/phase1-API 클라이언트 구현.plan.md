<!-- c5930d5f-d892-4cd1-9130-c4306627212a 5e5941f3-4df1-42e3-9f80-852d45903e9b -->
# Phase 1: API 클라이언트 구현 및 기본 구조 설정

## 작업 목표

한국관광공사 Tour API를 활용하기 위한 클라이언트 구현, 타입 정의, 레이아웃 업데이트, 공통 컴포넌트를 생성하여 프로젝트의 기본 구조를 완성합니다.

## 작업 단계

### 1. 타입 정의 생성 (우선 작업)

타입 정의를 먼저 생성하여 API 클라이언트 구현 시 타입 안정성을 확보합니다.

#### 1.1 `lib/types/tour.ts` 생성

**파일 경로**: `lib/types/tour.ts`

**포함할 인터페이스**:

- `TourItem`: 관광지 목록 항목 (PRD 5.1 참고)
  - `addr1`, `addr2?`, `areacode`, `contentid`, `contenttypeid`, `title`, `mapx`, `mapy`, `firstimage?`, `firstimage2?`, `tel?`, `cat1?`, `cat2?`, `cat3?`, `modifiedtime`
- `TourDetail`: 상세 정보 (PRD 5.2 참고)
  - `contentid`, `contenttypeid`, `title`, `addr1`, `addr2?`, `zipcode?`, `tel?`, `homepage?`, `overview?`, `firstimage?`, `firstimage2?`, `mapx`, `mapy`
- `TourIntro`: 운영 정보 (PRD 5.3 참고)
  - `contentid`, `contenttypeid`, `usetime?`, `restdate?`, `infocenter?`, `parking?`, `chkpet?` 등 타입별 필드
  - 타입별로 필드가 다르므로 유니온 타입 또는 선택적 필드로 처리
- `TourImage`: 이미지 정보
  - `contentid`, `imgname`, `originimgurl`, `serialnum` 등
- `PetTourInfo`: 반려동물 정보 (PRD 5.3 참고)
  - `contentid`, `contenttypeid`, `chkpetleash?`, `chkpetsize?`, `chkpetplace?`, `chkpetfee?`, `petinfo?`, `parking?`
- `AreaCode`: 지역 코드 정보
  - `code`, `name`, `rnum` 등
- API 응답 래퍼 타입
  - `TourApiResponse<T>`: 공통 응답 구조 (response.body.items.item 등)

#### 1.2 `lib/types/stats.ts` 생성

**파일 경로**: `lib/types/stats.ts`

**포함할 인터페이스**:

- `RegionStats`: 지역별 통계
  - `regionCode: string`, `regionName: string`, `count: number`
- `TypeStats`: 타입별 통계
  - `contentTypeId: string`, `contentTypeName: string`, `count: number`
- `StatsSummary`: 통계 요약
  - `totalCount: number`, `topRegions: RegionStats[]`, `topTypes: TypeStats[]`, `lastUpdated: Date`

### 2. API 클라이언트 구현

한국관광공사 Tour API를 호출하는 클라이언트를 구현합니다.

#### 2.1 `lib/api/tour-api.ts` 생성

**파일 경로**: `lib/api/tour-api.ts`

**Base URL**: `https://apis.data.go.kr/B551011/KorService2`

**공통 파라미터 처리 함수**:

```typescript
function getCommonParams(): Record<string, string>
```

- `serviceKey`: 환경변수에서 가져오기 (서버: `TOUR_API_KEY`, 클라이언트: `NEXT_PUBLIC_TOUR_API_KEY`)
- `MobileOS`: "ETC"
- `MobileApp`: "MyTrip"
- `_type`: "json"

**에러 처리 및 재시도 로직**:

- `TourApiError` 커스텀 에러 클래스 생성
- 재시도 로직: 최대 3회, 지수 백오프 (1초, 2초, 4초)
- 타임아웃: 10초
- 에러 로깅 및 사용자 친화적 에러 메시지

**구현할 API 함수들**:

1. **`getAreaCode()`** - 지역코드 조회

   - 엔드포인트: `/areaCode2`
   - 파라미터: `numOfRows?`, `pageNo?`
   - 반환 타입: `Promise<AreaCode[]>`

2. **`getAreaBasedList()`** - 지역 기반 목록

   - 엔드포인트: `/areaBasedList2`
   - 파라미터: `areaCode?`, `contentTypeId?`, `numOfRows?`, `pageNo?`, `arrange?` (정렬)
   - 반환 타입: `Promise<{ items: TourItem[], totalCount: number }>`

3. **`searchKeyword()`** - 키워드 검색

   - 엔드포인트: `/searchKeyword2`
   - 파라미터: `keyword`, `areaCode?`, `contentTypeId?`, `numOfRows?`, `pageNo?`
   - 반환 타입: `Promise<{ items: TourItem[], totalCount: number }>`

4. **`getDetailCommon()`** - 공통 정보

   - 엔드포인트: `/detailCommon2`
   - 파라미터: `contentId`, `defaultYN?`, `firstImageYN?`, `areacodeYN?`, `catcodeYN?`, `addrinfoYN?`, `mapinfoYN?`, `overviewYN?`
   - 반환 타입: `Promise<TourDetail>`

5. **`getDetailIntro()`** - 소개 정보

   - 엔드포인트: `/detailIntro2`
   - 파라미터: `contentId`, `contentTypeId`
   - 반환 타입: `Promise<TourIntro>`

6. **`getDetailImage()`** - 이미지 목록

   - 엔드포인트: `/detailImage2`
   - 파라미터: `contentId`, `imageYN?`, `subImageYN?`
   - 반환 타입: `Promise<TourImage[]>`

7. **`getDetailPetTour()`** - 반려동물 정보

   - 엔드포인트: `/detailPetTour2`
   - 파라미터: `contentId`
   - 반환 타입: `Promise<PetTourInfo | null>` (정보가 없을 수 있음)

**구현 패턴**:

- 모든 함수는 `async` 함수
- 환경변수 검증 (없으면 에러 throw)
- fetch API 사용 (Next.js 15 네이티브 fetch)
- 응답 파싱 및 에러 처리
- 타입 안정성 보장

### 3. 레이아웃 구조 업데이트

#### 3.1 `app/layout.tsx` 업데이트

**현재 파일**: [app/layout.tsx](app/layout.tsx)

**업데이트 사항**:

- 메타데이터 수정
  - `title`: "My Trip - 한국 관광지 정보"
  - `description`: "전국 관광지 정보를 검색하고 지도에서 확인하세요"
  - Open Graph 태그 추가 (선택 사항)

#### 3.2 `components/Navbar.tsx` 업데이트

**현재 파일**: [components/Navbar.tsx](components/Navbar.tsx)

**업데이트 사항**:

- 로고 텍스트: "SaaS Template" → "My Trip"
- 검색창 추가 (헤더 중앙 또는 우측)
  - `components/tour-search.tsx`는 Phase 2에서 구현하므로, 여기서는 검색창 UI만 추가
  - 검색 기능은 Phase 2에서 구현
- 네비게이션 링크 추가
  - 홈 (`/`)
  - 통계 (`/stats`)
  - 북마크 (`/bookmarks`) - 선택 사항
- 반응형 디자인 (모바일에서 햄버거 메뉴)

### 4. 공통 컴포넌트 생성

#### 4.1 `components/ui/loading.tsx` 생성

**파일 경로**: `components/ui/loading.tsx`

**기능**:

- 로딩 스피너 컴포넌트
- shadcn/ui 스타일 적용
- 크기 옵션 (sm, md, lg)
- 텍스트 옵션 (선택 사항)

#### 4.2 `components/ui/skeleton.tsx` 생성

**파일 경로**: `components/ui/skeleton.tsx`

**기능**:

- 스켈레톤 UI 컴포넌트
- shadcn/ui의 Skeleton 컴포넌트 사용
- 다양한 크기 및 형태 지원
- 카드 형태 스켈레톤 (관광지 카드용)

**shadcn/ui 설치 필요**:

```bash
pnpx shadcn@latest add skeleton
```

#### 4.3 `components/ui/error.tsx` 생성

**파일 경로**: `components/ui/error.tsx`

**기능**:

- 에러 메시지 표시 컴포넌트
- 에러 아이콘 (lucide-react)
- 에러 메시지 표시
- 재시도 버튼 (선택 사항)
- 사용자 친화적 메시지

#### 4.4 `components/ui/toast.tsx` 생성

**파일 경로**: `components/ui/toast.tsx`

**기능**:

- 토스트 알림 컴포넌트
- shadcn/ui의 Toast 컴포넌트 사용
- 성공/에러/정보 타입 지원

**shadcn/ui 설치 필요**:

```bash
pnpx shadcn@latest add toast
```

**Toast Provider 추가**:

- `app/layout.tsx`에 `Toaster` 컴포넌트 추가

## 구현 순서

1. **타입 정의 생성** (1.1, 1.2)

   - API 클라이언트 구현 전에 타입을 정의하여 타입 안정성 확보

2. **API 클라이언트 구현** (2.1)

   - 공통 파라미터 처리 함수
   - 에러 처리 및 재시도 로직
   - 각 API 함수 순차 구현

3. **공통 컴포넌트 생성** (4.1-4.4)

   - shadcn/ui 컴포넌트 설치
   - 각 컴포넌트 구현

4. **레이아웃 업데이트** (3.1, 3.2)

   - 메타데이터 수정
   - Navbar 업데이트

## 참고 자료

- [docs/PRD.md](docs/PRD.md) - API 명세 및 데이터 구조 (502-602줄)
- [docs/TODO.md](docs/TODO.md) - 작업 항목 (41-74줄)
- 한국관광공사 API 문서: https://www.data.go.kr/data/15101578/openapi.do

## 검증 방법

1. 타입 정의 파일이 생성되었는지 확인
2. API 클라이언트 함수들이 올바르게 구현되었는지 확인
3. 각 API 함수의 타입이 올바른지 확인
4. 에러 처리 및 재시도 로직이 작동하는지 확인
5. 공통 컴포넌트가 올바르게 렌더링되는지 확인
6. 레이아웃이 업데이트되었는지 확인

### To-dos

- [ ] 커스텀 한국어 로컬라이제이션 파일 생성
- [ ] ClerkProvider에 커스텀 로컬라이제이션 적용
- [ ] 로컬라이제이션 가이드 문서 작성