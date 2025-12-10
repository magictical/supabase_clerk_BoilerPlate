/**
 * @file app/page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 한국관광공사 Tour API를 활용한 관광지 목록 페이지입니다.
 * 검색, 필터, 관광지 목록, 지도 기능을 포함합니다.
 *
 * 주요 기능:
 * - 관광지 목록 표시 (Phase 2.2) ✅
 * - 필터 기능 (지역, 타입, 반려동물) (Phase 2.3)
 * - 키워드 검색 (Phase 2.4)
 * - 네이버 지도 연동 (Phase 2.5)
 * - 페이지네이션 (Phase 2.6)
 *
 * @see {@link docs/PRD.md} - 기능 요구사항
 * @see {@link docs/TODO.md} - Phase 2 작업 목록
 */

import { getAreaBasedList, TourApiError } from "@/lib/api/tour-api";
import { TourList } from "@/components/tour-list";
import { Error } from "@/components/ui/error";

export default async function HomePage() {
  try {
    // 기본 관광지 목록 조회 (전체 지역, 전체 타입, 수정일순)
    const { items, totalCount } = await getAreaBasedList(
      {
        numOfRows: 20,
        pageNo: 1,
        arrange: "C", // 수정일순
      },
      true // 서버 사이드
    );

    return (
      <main className="min-h-[calc(100vh-4rem)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 검색 영역 - Phase 2.4에서 구현 */}
          <section className="mb-6">
            {/* tour-search.tsx 배치 예정 */}
            <div className="h-16 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                검색 영역 (Phase 2.4에서 구현 예정)
              </p>
            </div>
          </section>

          {/* 필터 영역 - Phase 2.3에서 구현 */}
          <section className="mb-6">
            {/* tour-filters.tsx 배치 예정 */}
            <div className="h-20 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                필터 영역 (Phase 2.3에서 구현 예정)
              </p>
            </div>
          </section>

          {/* 메인 콘텐츠 영역 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 리스트 영역 (좌측 또는 상단) */}
            <section className="lg:order-1">
              <TourList tours={items} />
            </section>

            {/* 지도 영역 (우측 또는 하단) - Phase 2.5에서 구현 */}
            <section className="lg:order-2">
              {/* naver-map.tsx 배치 예정 */}
              <div className="min-h-[600px] bg-muted/50 rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  네이버 지도 영역 (Phase 2.5에서 구현 예정)
                </p>
              </div>
            </section>
          </div>

          {/* 페이지네이션 영역 - Phase 2.6에서 구현 */}
          <section className="mt-8">
            {/* 페이지네이션 컴포넌트 배치 예정 */}
            <div className="h-12 bg-muted/50 rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                페이지네이션 영역 (Phase 2.6에서 구현 예정) - 총 {totalCount}개
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  } catch (error) {
    // 에러 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === 'development') {
      console.error('관광지 목록 로딩 에러:', error);
      
      // TourApiError인 경우 상세 정보 출력
      if (error instanceof Error) {
        console.error('에러 메시지:', error.message);
        console.error('에러 이름:', error.name);
      }
    }

    // 에러 처리
    let errorMessage = "관광지 목록을 불러오는 중 오류가 발생했습니다.";
    
    // TourApiError인 경우 상세 정보 표시
    if (error instanceof TourApiError) {
      if (error.message.includes('API key is missing')) {
        errorMessage = "Tour API 키가 설정되지 않았습니다. .env 파일에 NEXT_PUBLIC_TOUR_API_KEY를 확인해주세요.";
      } else if (error.message.includes('API error')) {
        errorMessage = `API 오류: ${error.message.replace('API error: ', '')}`;
      } else if (error.message.includes('Request timeout')) {
        errorMessage = "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.";
      } else {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      // 일반 Error인 경우
      if (error.message.includes('Network error')) {
        errorMessage = "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";
      } else {
        errorMessage = error.message;
      }
    }

    return (
      <main className="min-h-[calc(100vh-4rem)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Error
            message={errorMessage}
            fullScreen
          />
        </div>
      </main>
    );
  }
}
