/**
 * @file components/tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * 로딩, 에러, 빈 상태를 처리합니다.
 *
 * @see {@link docs/PRD.md} - MVP 2.1 요구사항
 */

"use client";

import { TourCard } from "@/components/tour-card";
import { TourCardListSkeleton } from "@/components/ui/tour-card-skeleton";
import { Error } from "@/components/ui/error";
import type { TourItem } from "@/lib/types/tour";

interface TourListProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 객체 */
  error?: Error | null;
  /** 재시도 함수 */
  onRetry?: () => void;
}

export function TourList({
  tours,
  isLoading = false,
  error = null,
  onRetry,
}: TourListProps) {
  // 로딩 상태
  if (isLoading) {
    return <TourCardListSkeleton count={6} />;
  }

  // 에러 상태
  if (error) {
    return (
      <Error
        message="관광지 목록을 불러오는 중 오류가 발생했습니다."
        onRetry={onRetry}
        retryText="다시 시도"
      />
    );
  }

  // 빈 상태
  if (tours.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          표시할 관광지가 없습니다.
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          다른 필터를 선택하거나 검색어를 변경해보세요.
        </p>
      </div>
    );
  }

  // 목록 표시
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tours.map((tour) => (
        <TourCard key={tour.contentid} tour={tour} />
      ))}
    </div>
  );
}

