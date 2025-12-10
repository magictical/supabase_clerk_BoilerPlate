/**
 * @file components/ui/tour-card-skeleton.tsx
 * @description 관광지 카드용 스켈레톤 UI
 *
 * 관광지 목록 로딩 중 표시할 카드 형태의 스켈레톤 컴포넌트입니다.
 */

import { Skeleton } from '@/components/ui/skeleton';

export function TourCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 이미지 영역 */}
      <Skeleton className="w-full h-48" />

      {/* 내용 영역 */}
      <div className="p-4 space-y-3">
        {/* 제목 */}
        <Skeleton className="h-6 w-3/4" />

        {/* 주소 */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        {/* 뱃지 및 개요 */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

/**
 * 관광지 카드 목록 스켈레톤
 */
export function TourCardListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <TourCardSkeleton key={i} />
      ))}
    </div>
  );
}

