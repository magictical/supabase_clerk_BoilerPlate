/**
 * @file app/page.tsx
 * @description 홈페이지 - 관광지 목록
 *
 * 한국관광공사 Tour API를 활용한 관광지 목록 페이지입니다.
 * 검색, 필터, 관광지 목록, 지도 기능을 포함합니다.
 *
 * 주요 기능:
 * - 관광지 목록 표시 (Phase 2.2) ✅
 * - 필터 기능 (지역, 타입, 반려동물) (Phase 2.3) ✅
 * - 키워드 검색 (Phase 2.4)
 * - 네이버 지도 연동 (Phase 2.5)
 * - 페이지네이션 (Phase 2.6)
 *
 * @see {@link docs/PRD.md} - 기능 요구사항
 * @see {@link docs/TODO.md} - Phase 2 작업 목록
 */

import { TourPageContent } from "@/components/tour-page-content";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 메인 콘텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 필터 및 리스트 영역 (좌측 또는 상단) */}
          <section className="lg:order-1">
            <TourPageContent />
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
              페이지네이션 영역 (Phase 2.6에서 구현 예정)
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
