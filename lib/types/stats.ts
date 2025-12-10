/**
 * @file lib/types/stats.ts
 * @description 통계 대시보드 관련 TypeScript 타입 정의
 *
 * 이 파일은 통계 페이지에서 사용되는 데이터 구조를 정의합니다.
 * 지역별, 타입별 관광지 통계 데이터를 다룹니다.
 */

/**
 * 지역별 통계 정보
 */
export interface RegionStats {
  /** 지역 코드 */
  regionCode: string;
  /** 지역명 */
  regionName: string;
  /** 관광지 개수 */
  count: number;
}

/**
 * 타입별 통계 정보
 */
export interface TypeStats {
  /** 콘텐츠타입ID */
  contentTypeId: string;
  /** 콘텐츠타입명 */
  contentTypeName: string;
  /** 관광지 개수 */
  count: number;
}

/**
 * 통계 요약 정보
 */
export interface StatsSummary {
  /** 전체 관광지 수 */
  totalCount: number;
  /** 상위 지역 (Top 3) */
  topRegions: RegionStats[];
  /** 상위 타입 (Top 3) */
  topTypes: TypeStats[];
  /** 마지막 업데이트 시간 */
  lastUpdated: Date;
}


