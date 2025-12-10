/**
 * @file components/tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역, 관광 타입, 정렬 옵션을 선택할 수 있는 필터 UI를 제공합니다.
 * 필터 변경 시 콜백 함수를 호출하여 부모 컴포넌트에 알립니다.
 *
 * @see {@link docs/PRD.md} - MVP 2.1 필터 요구사항
 */

"use client";

import { useEffect, useState } from "react";
import { getAreaCode } from "@/lib/api/tour-api";
import {
  CONTENT_TYPE,
  CONTENT_TYPE_NAMES,
  type ContentTypeId,
} from "@/lib/types/tour";
import type { AreaCode } from "@/lib/types/tour";
import type { FilterState, DEFAULT_FILTER_STATE } from "@/lib/types/filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, RotateCcw, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import type { PetSize } from "@/lib/types/filter";
import { petSizeToKorean } from "@/lib/utils/pet-size";

interface TourFiltersProps {
  /** 현재 필터 상태 */
  filters: FilterState;
  /** 필터 변경 콜백 */
  onFilterChange: (filters: FilterState) => void;
}

export function TourFilters({ filters, onFilterChange }: TourFiltersProps) {
  const [areaCodes, setAreaCodes] = useState<AreaCode[]>([]);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [areaError, setAreaError] = useState<Error | null>(null);

  // 지역 목록 로드
  useEffect(() => {
    const loadAreaCodes = async () => {
      try {
        setIsLoadingAreas(true);
        setAreaError(null);
        const codes = await getAreaCode(100, 1, false); // 클라이언트 사이드
        setAreaCodes(codes);
      } catch (error) {
        console.error("지역 목록 로드 실패:", error);
        setAreaError(error as Error);
      } finally {
        setIsLoadingAreas(false);
      }
    };

    loadAreaCodes();
  }, []);

  // 지역 필터 변경
  const handleAreaChange = (value: string) => {
    const newFilters: FilterState = {
      ...filters,
      areaCode: value === "all" ? undefined : value,
      pageNo: 1, // 필터 변경 시 페이지 리셋
    };
    onFilterChange(newFilters);
  };

  // 관광 타입 필터 변경
  const handleContentTypeToggle = (contentTypeId: ContentTypeId) => {
    const currentIds = filters.contentTypeIds || [];
    const newIds = currentIds.includes(contentTypeId)
      ? currentIds.filter((id) => id !== contentTypeId)
      : [...currentIds, contentTypeId];

    // 개발 환경에서 디버깅 로그
    if (process.env.NODE_ENV === 'development') {
      console.log('관광 타입 토글:', {
        contentTypeId,
        currentIds,
        newIds,
      });
    }

    const newFilters: FilterState = {
      ...filters,
      contentTypeIds: newIds.length > 0 ? newIds : undefined,
      pageNo: 1, // 필터 변경 시 페이지 리셋
    };
    onFilterChange(newFilters);
  };

  // 정렬 옵션 변경
  const handleArrangeChange = (value: string) => {
    const newFilters: FilterState = {
      ...filters,
      arrange: value as "A" | "B" | "C" | "D",
      pageNo: 1, // 필터 변경 시 페이지 리셋
    };
    onFilterChange(newFilters);
  };

  // 필터 초기화
  const handleReset = () => {
    onFilterChange({ ...DEFAULT_FILTER_STATE });
  };

  // 선택된 관광 타입 제거
  const handleRemoveContentType = (contentTypeId: string) => {
    const currentIds = filters.contentTypeIds || [];
    const newIds = currentIds.filter((id) => id !== contentTypeId);

    const newFilters: FilterState = {
      ...filters,
      contentTypeIds: newIds.length > 0 ? newIds : undefined,
      pageNo: 1,
    };
    onFilterChange(newFilters);
  };

  // 모든 관광 타입 선택/해제
  const handleSelectAllContentTypes = () => {
    const allTypes: ContentTypeId[] = Object.values(CONTENT_TYPE) as ContentTypeId[];
    const currentIds = filters.contentTypeIds;
    
    // 모든 타입이 선택되어 있는지 확인
    // contentTypeIds가 undefined이거나 빈 배열이면 false
    // 모든 타입이 포함되어 있으면 true
    const isAllSelected = currentIds 
      ? currentIds.length === allTypes.length && 
        allTypes.every((type) => currentIds.includes(type))
      : false;

    const newFilters: FilterState = {
      ...filters,
      contentTypeIds: isAllSelected ? undefined : allTypes,
      pageNo: 1,
    };
    onFilterChange(newFilters);
  };

  // 반려동물 동반 가능 토글
  const handlePetFriendlyToggle = () => {
    const newFilters: FilterState = {
      ...filters,
      petFriendly: !filters.petFriendly,
      petSizes: !filters.petFriendly ? undefined : filters.petSizes, // 비활성화 시 크기 필터도 초기화
      pageNo: 1,
    };
    onFilterChange(newFilters);
  };

  // 반려동물 크기 필터 변경
  const handlePetSizeToggle = (size: PetSize) => {
    const currentSizes = filters.petSizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];

    const newFilters: FilterState = {
      ...filters,
      petSizes: newSizes.length > 0 ? newSizes : undefined,
      pageNo: 1,
    };
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">필터</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          초기화
        </Button>
      </div>

      {/* 지역 필터 */}
      <div className="space-y-2">
        <Label htmlFor="area-filter">지역</Label>
        {isLoadingAreas ? (
          <div className="h-10 flex items-center">
            <Loading size="sm" text="지역 목록 로딩 중..." />
          </div>
        ) : areaError ? (
          <p className="text-sm text-destructive">
            지역 목록을 불러올 수 없습니다.
          </p>
        ) : (
          <Select
            value={filters.areaCode || "all"}
            onValueChange={handleAreaChange}
          >
            <SelectTrigger id="area-filter">
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {areaCodes.map((area) => (
                <SelectItem key={area.code} value={area.code}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* 관광 타입 필터 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>관광 타입</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAllContentTypes}
            className="h-auto py-1 text-xs"
          >
            {(() => {
              const allTypes: ContentTypeId[] = Object.values(CONTENT_TYPE) as ContentTypeId[];
              const currentIds = filters.contentTypeIds;
              const isAllSelected = currentIds 
                ? currentIds.length === allTypes.length && 
                  allTypes.every((type) => currentIds.includes(type))
                : false;
              return isAllSelected ? "전체 해제" : "전체 선택";
            })()}
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.entries(CONTENT_TYPE) as [string, ContentTypeId][]).map(
            ([key, contentTypeId]) => {
              // contentTypeIds가 undefined이면 체크되지 않음
              // contentTypeIds가 있으면 해당 타입이 포함되어 있는지 확인
              const isChecked = filters.contentTypeIds
                ? filters.contentTypeIds.includes(contentTypeId)
                : false;
              return (
                <div key={contentTypeId} className="flex items-center space-x-2">
                  <Checkbox
                    id={`content-type-${contentTypeId}`}
                    checked={isChecked}
                    onCheckedChange={() => handleContentTypeToggle(contentTypeId)}
                  />
                  <Label
                    htmlFor={`content-type-${contentTypeId}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {CONTENT_TYPE_NAMES[contentTypeId]}
                  </Label>
                </div>
              );
            }
          )}
        </div>
        {/* 선택된 타입 뱃지 */}
        {filters.contentTypeIds && filters.contentTypeIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.contentTypeIds
              .filter((id): id is ContentTypeId => 
                Object.values(CONTENT_TYPE).includes(id as ContentTypeId)
              )
              .map((contentTypeId) => {
                const typeName = CONTENT_TYPE_NAMES[contentTypeId];
                if (!typeName) return null;
                
                return (
                  <Badge
                    key={contentTypeId}
                    variant="secondary"
                    className="gap-1"
                  >
                    {typeName}
                    <button
                      onClick={() => handleRemoveContentType(contentTypeId)}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      aria-label={`${typeName} 제거`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
          </div>
        )}
      </div>

      {/* 정렬 옵션 */}
      <div className="space-y-2">
        <Label htmlFor="arrange-filter">정렬</Label>
        <Select
          value={filters.arrange || DEFAULT_FILTER_STATE.arrange}
          onValueChange={handleArrangeChange}
        >
          <SelectTrigger id="arrange-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="C">최신순</SelectItem>
            <SelectItem value="A">이름순</SelectItem>
            <SelectItem value="B">조회순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 반려동물 필터 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>반려동물 동반</Label>
          <Button
            variant={filters.petFriendly ? "default" : "outline"}
            size="sm"
            onClick={handlePetFriendlyToggle}
            className="gap-2"
          >
            <Heart className="w-4 h-4" />
            {filters.petFriendly ? "동반 가능" : "전체"}
          </Button>
        </div>

        {filters.petFriendly && (
          <div className="space-y-2">
            <Label className="text-sm">크기별 필터</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as PetSize[]).map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pet-size-${size}`}
                    checked={filters.petSizes?.includes(size) || false}
                    onCheckedChange={() => handlePetSizeToggle(size)}
                  />
                  <Label
                    htmlFor={`pet-size-${size}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {petSizeToKorean(size)}
                  </Label>
                </div>
              ))}
            </div>
            {/* 선택된 크기 뱃지 */}
            {filters.petSizes && filters.petSizes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.petSizes.map((size) => (
                  <Badge
                    key={size}
                    variant="secondary"
                    className="gap-1"
                  >
                    {petSizeToKorean(size)}
                    <button
                      onClick={() => handlePetSizeToggle(size)}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                      aria-label={`${petSizeToKorean(size)} 제거`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

