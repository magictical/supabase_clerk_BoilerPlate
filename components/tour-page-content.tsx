/**
 * @file components/tour-page-content.tsx
 * @description 관광지 목록 페이지 콘텐츠 컴포넌트
 *
 * 필터와 목록을 포함한 Client Component입니다.
 * URL 쿼리 파라미터를 통해 필터 상태를 관리하고, 필터 변경 시 API를 재호출합니다.
 *
 * @see {@link docs/PRD.md} - MVP 2.1 요구사항
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, useMemo } from "react";
import { getAreaBasedList, searchKeyword, TourApiError } from "@/lib/api/tour-api";
import { TourFilters } from "@/components/tour-filters";
import { TourSearch } from "@/components/tour-search";
import { TourList } from "@/components/tour-list";
import {
  parseFilterFromSearchParams,
  filterToSearchParams,
  type FilterState,
} from "@/lib/types/filter";
import type { TourItem } from "@/lib/types/tour";
import type { PetTourInfo } from "@/lib/types/tour";
import { collectPetTourInfo } from "@/lib/utils/pet-tour-cache";
import { parsePetSize } from "@/lib/utils/pet-size";
import { Loading } from "@/components/ui/loading";

export function TourPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [tours, setTours] = useState<TourItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [petTourInfoMap, setPetTourInfoMap] = useState<
    Map<string, PetTourInfo | null>
  >(new Map());
  const [isLoadingPetInfo, setIsLoadingPetInfo] = useState(false);

  // URL에서 필터 상태 파싱
  const filters = parseFilterFromSearchParams(
    Object.fromEntries(searchParams.entries())
  );

  // 개발 환경에서 디버깅 로그
  if (process.env.NODE_ENV === 'development') {
    console.log('필터 상태:', {
      filters,
      contentTypeIds: filters.contentTypeIds,
      searchParams: Object.fromEntries(searchParams.entries()),
    });
  }

  // 필터 변경 시 데이터 로드
  useEffect(() => {
    loadTours(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 반려동물 정보 수집 (필터가 활성화된 경우)
  useEffect(() => {
    if (tours.length > 0 && filters.petFriendly) {
      setIsLoadingPetInfo(true);
      collectPetTourInfo(tours)
        .then((map) => {
          setPetTourInfoMap(map);
          setIsLoadingPetInfo(false);
        })
        .catch((err) => {
          console.error("반려동물 정보 수집 실패:", err);
          setIsLoadingPetInfo(false);
        });
    } else {
      // 필터가 비활성화되면 맵 초기화
      setPetTourInfoMap(new Map());
    }
  }, [tours, filters.petFriendly]);

  const loadTours = async (filterState: FilterState) => {
    try {
      setError(null);
      startTransition(async () => {
        let result;

        // 검색 키워드가 있으면 searchKeyword() 사용
        if (filterState.keyword && filterState.keyword.trim()) {
          result = await searchKeyword(
            filterState.keyword.trim(),
            {
              areaCode: filterState.areaCode,
              contentTypeId:
                filterState.contentTypeIds && filterState.contentTypeIds.length === 1
                  ? filterState.contentTypeIds[0]
                  : undefined, // 다중 선택 시 API는 단일 타입만 지원하므로 undefined
              numOfRows: filterState.numOfRows || 20,
              pageNo: filterState.pageNo || 1,
            },
            false // 클라이언트 사이드
          );
        } else {
          // 검색 키워드가 없으면 getAreaBasedList() 사용
          result = await getAreaBasedList(
            {
              areaCode: filterState.areaCode,
              contentTypeId:
                filterState.contentTypeIds && filterState.contentTypeIds.length === 1
                  ? filterState.contentTypeIds[0]
                  : undefined, // 다중 선택 시 API는 단일 타입만 지원하므로 undefined
              numOfRows: filterState.numOfRows || 20,
              pageNo: filterState.pageNo || 1,
              arrange: filterState.arrange || "C",
            },
            false // 클라이언트 사이드
          );
        }

        setTours(result.items);
        setTotalCount(result.totalCount);
      });
    } catch (err) {
      console.error("관광지 목록 로드 실패:", err);
      setError(err instanceof Error ? err : new Error("알 수 없는 오류"));
      setTours([]);
      setTotalCount(0);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    const params = filterToSearchParams(newFilters);
    const queryString = new URLSearchParams(params).toString();
    router.push(`/?${queryString}`, { scroll: false });
  };

  const handleSearch = (keyword: string) => {
    const newFilters: FilterState = {
      ...filters,
      keyword: keyword || undefined,
      pageNo: 1, // 검색 시 페이지 리셋
    };
    handleFilterChange(newFilters);
  };

  // 관광 타입 필터링 (클라이언트 사이드에서 다중 선택 처리)
  // API는 단일 타입만 지원하므로, 다중 선택 시 클라이언트에서 필터링
  const contentTypeFilteredTours = useMemo(() => {
    return filters.contentTypeIds && filters.contentTypeIds.length > 0
      ? tours.filter((tour) =>
          filters.contentTypeIds!.includes(tour.contenttypeid)
        )
      : tours;
  }, [tours, filters.contentTypeIds]);

  // 반려동물 필터링
  const filteredTours = useMemo(() => {
    if (!filters.petFriendly) {
      return contentTypeFilteredTours;
    }

    // 반려동물 정보가 아직 수집 중인 경우 빈 배열 반환
    if (isLoadingPetInfo && petTourInfoMap.size === 0) {
      return [];
    }

    return contentTypeFilteredTours.filter((tour) => {
      const petInfo = petTourInfoMap.get(tour.contentid);

      // 반려동물 정보가 없는 경우 제외
      if (!petInfo) {
        return false;
      }

      // 동반 가능 여부 확인
      const chkpetleash = petInfo.chkpetleash?.trim().toLowerCase();
      if (
        chkpetleash !== 'y' &&
        chkpetleash !== 'yes' &&
        chkpetleash !== '가능' &&
        chkpetleash !== '동반가능'
      ) {
        return false;
      }

      // 크기 필터 확인
      if (filters.petSizes && filters.petSizes.length > 0) {
        const petSize = parsePetSize(petInfo.chkpetsize);
        if (!petSize) {
          return false;
        }

        // 선택된 크기 중 하나라도 일치하면 포함
        if (!filters.petSizes.includes(petSize)) {
          return false;
        }
      }

      return true;
    });
  }, [
    contentTypeFilteredTours,
    petTourInfoMap,
    filters.petFriendly,
    filters.petSizes,
    isLoadingPetInfo,
  ]);

  return (
    <>
      <TourSearch
        keyword={filters.keyword}
        onSearch={handleSearch}
        isLoading={isPending}
      />
      <div className="mt-4">
        <TourFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>
      <div className="mt-4">
        {totalCount > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            {filters.keyword ? (
              <>
                &quot;{filters.keyword}&quot; 검색 결과: {filteredTours.length}개
                {(filters.areaCode ||
                  filters.contentTypeIds?.length > 0 ||
                  filters.petFriendly) && (
                  <span className="ml-2">(필터 적용됨</span>
                )}
                {filters.petFriendly && isLoadingPetInfo && (
                  <span className="ml-1">- 반려동물 정보 수집 중...</span>
                )}
                {(filters.areaCode ||
                  filters.contentTypeIds?.length > 0 ||
                  filters.petFriendly) && <span>)</span>}
              </>
            ) : (
              <>
                총 {totalCount}개의 관광지가 있습니다.
                {(filters.contentTypeIds?.length > 0 ||
                  filters.petFriendly ||
                  filteredTours.length !== totalCount) && (
                  <span className="ml-2">
                    (필터링: {filteredTours.length}개
                    {filters.petFriendly && isLoadingPetInfo && (
                      <span className="ml-1">- 반려동물 정보 수집 중...</span>
                    )}
                    )
                  </span>
                )}
              </>
            )}
          </p>
        )}
        {filters.petFriendly && isLoadingPetInfo && petTourInfoMap.size === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading size="lg" text="반려동물 정보를 수집하는 중..." />
          </div>
        ) : (
          <TourList
            tours={filteredTours}
            isLoading={isPending}
            error={error}
            onRetry={() => loadTours(filters)}
          />
        )}
      </div>
    </>
  );
}

