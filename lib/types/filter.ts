/**
 * @file lib/types/filter.ts
 * @description 필터 상태 타입 정의 및 유틸리티 함수
 *
 * 관광지 목록 필터링을 위한 타입과 URL 쿼리 파라미터 변환 함수를 제공합니다.
 */

/**
 * 반려동물 크기 타입
 */
export type PetSize = 'small' | 'medium' | 'large';

/**
 * 필터 상태 타입
 */
export interface FilterState {
  /** 지역 코드 (시/도) */
  areaCode?: string;
  /** 관광 타입 ID 배열 (다중 선택) */
  contentTypeIds?: string[];
  /** 정렬 옵션 */
  arrange?: 'A' | 'B' | 'C' | 'D'; // A: 제목순, B: 조회순, C: 수정일순, D: 거리순
  /** 페이지 번호 */
  pageNo?: number;
  /** 한 페이지 결과 수 */
  numOfRows?: number;
  /** 반려동물 동반 가능 여부 */
  petFriendly?: boolean;
  /** 반려동물 크기 필터 (소형, 중형, 대형) */
  petSizes?: PetSize[];
  /** 검색 키워드 */
  keyword?: string;
}

/**
 * 기본 필터 상태
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  arrange: 'C', // 수정일순
  pageNo: 1,
  numOfRows: 20,
};

/**
 * URL 쿼리 파라미터에서 필터 상태 파싱
 * @param searchParams - URL 쿼리 파라미터 객체
 * @returns 필터 상태
 */
export function parseFilterFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): FilterState {
  const filters: FilterState = { ...DEFAULT_FILTER_STATE };

  // 지역 코드
  if (searchParams.areaCode && typeof searchParams.areaCode === 'string') {
    filters.areaCode = searchParams.areaCode;
  }

  // 관광 타입 ID 배열
  if (searchParams.contentTypeIds) {
    let ids: string[];
    if (Array.isArray(searchParams.contentTypeIds)) {
      ids = searchParams.contentTypeIds;
    } else {
      // 문자열인 경우 쉼표로 분리 (예: "12,14" -> ["12", "14"])
      ids = searchParams.contentTypeIds.split(',').map(id => id.trim());
    }
    filters.contentTypeIds = ids.filter((id): id is string => typeof id === 'string' && id.length > 0);
  }

  // 정렬 옵션
  if (
    searchParams.arrange &&
    typeof searchParams.arrange === 'string' &&
    ['A', 'B', 'C', 'D'].includes(searchParams.arrange)
  ) {
    filters.arrange = searchParams.arrange as 'A' | 'B' | 'C' | 'D';
  }

  // 페이지 번호
  if (searchParams.pageNo && typeof searchParams.pageNo === 'string') {
    const pageNo = parseInt(searchParams.pageNo, 10);
    if (!isNaN(pageNo) && pageNo > 0) {
      filters.pageNo = pageNo;
    }
  }

  // 한 페이지 결과 수
  if (searchParams.numOfRows && typeof searchParams.numOfRows === 'string') {
    const numOfRows = parseInt(searchParams.numOfRows, 10);
    if (!isNaN(numOfRows) && numOfRows > 0) {
      filters.numOfRows = numOfRows;
    }
  }

  // 반려동물 동반 가능 여부
  if (searchParams.petFriendly && typeof searchParams.petFriendly === 'string') {
    filters.petFriendly = searchParams.petFriendly === 'true';
  }

  // 반려동물 크기 필터
  if (searchParams.petSizes) {
    let sizes: string[];
    if (Array.isArray(searchParams.petSizes)) {
      sizes = searchParams.petSizes;
    } else {
      // 문자열인 경우 쉼표로 분리 (예: "small,medium" -> ["small", "medium"])
      sizes = searchParams.petSizes.split(',').map((s) => s.trim());
    }
    const validSizes = sizes.filter(
      (s): s is PetSize => ['small', 'medium', 'large'].includes(s)
    );
    if (validSizes.length > 0) {
      filters.petSizes = validSizes;
    }
  }

  // 검색 키워드
  if (searchParams.keyword && typeof searchParams.keyword === 'string') {
    filters.keyword = searchParams.keyword.trim();
  }

  return filters;
}

/**
 * 필터 상태를 URL 쿼리 파라미터로 변환
 * @param filter - 필터 상태
 * @returns URL 쿼리 파라미터 객체
 */
export function filterToSearchParams(
  filter: FilterState
): Record<string, string> {
  const params: Record<string, string> = {};

  // 지역 코드
  if (filter.areaCode) {
    params.areaCode = filter.areaCode;
  }

  // 관광 타입 ID 배열
  if (filter.contentTypeIds && filter.contentTypeIds.length > 0) {
    params.contentTypeIds = filter.contentTypeIds.join(',');
  }

  // 정렬 옵션
  if (filter.arrange && filter.arrange !== DEFAULT_FILTER_STATE.arrange) {
    params.arrange = filter.arrange;
  }

  // 페이지 번호 (1이 아니면 포함)
  if (filter.pageNo && filter.pageNo !== 1) {
    params.pageNo = filter.pageNo.toString();
  }

  // 한 페이지 결과 수 (기본값이 아니면 포함)
  if (filter.numOfRows && filter.numOfRows !== DEFAULT_FILTER_STATE.numOfRows) {
    params.numOfRows = filter.numOfRows.toString();
  }

  // 반려동물 동반 가능 여부
  if (filter.petFriendly) {
    params.petFriendly = 'true';
  }

  // 반려동물 크기 필터
  if (filter.petSizes && filter.petSizes.length > 0) {
    params.petSizes = filter.petSizes.join(',');
  }

  // 검색 키워드
  if (filter.keyword && filter.keyword.trim()) {
    params.keyword = filter.keyword.trim();
  }

  return params;
}

