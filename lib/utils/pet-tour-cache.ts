/**
 * @file lib/utils/pet-tour-cache.ts
 * @description 반려동물 정보 캐싱 및 수집 유틸리티
 *
 * 관광지 목록에 대한 반려동물 정보를 효율적으로 수집하고 캐싱합니다.
 * API 호출을 최소화하기 위해 메모리 기반 캐시를 사용합니다.
 */

import { getDetailPetTour } from '@/lib/api/tour-api';
import type { PetTourInfo } from '@/lib/types/tour';
import type { TourItem } from '@/lib/types/tour';

/**
 * 반려동물 정보 캐시 (메모리 기반)
 * contentId -> PetTourInfo 매핑
 */
const petTourCache = new Map<string, PetTourInfo | null>();

/**
 * 동시 요청 수 제한 (성능 최적화)
 */
const CONCURRENT_LIMIT = 10;

/**
 * 배치로 나누어 처리하는 헬퍼 함수
 * @param items - 처리할 항목 배열
 * @param batchSize - 배치 크기
 * @param processor - 각 항목을 처리하는 함수
 * @returns 처리 결과 배열
 */
async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => processor(item))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * 관광지 목록에 대한 반려동물 정보를 병렬로 수집
 * @param tourItems - 관광지 목록
 * @returns contentId -> PetTourInfo 매핑
 */
export async function collectPetTourInfo(
  tourItems: TourItem[]
): Promise<Map<string, PetTourInfo | null>> {
  const resultMap = new Map<string, PetTourInfo | null>();

  // 캐시에 없는 항목만 필터링
  const itemsToFetch = tourItems.filter(
    (item) => !petTourCache.has(item.contentid)
  );

  // 캐시에 있는 항목은 바로 추가
  tourItems.forEach((item) => {
    const cached = petTourCache.get(item.contentid);
    if (cached !== undefined) {
      resultMap.set(item.contentid, cached);
    }
  });

  // 캐시에 없는 항목만 API 호출
  if (itemsToFetch.length > 0) {
    const fetchResults = await processInBatches(
      itemsToFetch,
      CONCURRENT_LIMIT,
      async (item) => {
        try {
          const petInfo = await getDetailPetTour(item.contentid, false);
          // 캐시에 저장
          petTourCache.set(item.contentid, petInfo);
          return { contentId: item.contentid, petInfo };
        } catch (error) {
          console.error(
            `반려동물 정보 조회 실패 (contentId: ${item.contentid}):`,
            error
          );
          // 에러 발생 시 null로 캐싱하여 재시도 방지
          petTourCache.set(item.contentid, null);
          return { contentId: item.contentid, petInfo: null };
        }
      }
    );

    // 결과를 맵에 추가
    fetchResults.forEach(({ contentId, petInfo }) => {
      resultMap.set(contentId, petInfo);
    });
  }

  return resultMap;
}

/**
 * 캐시 초기화 (필요 시)
 */
export function clearPetTourCache(): void {
  petTourCache.clear();
}

/**
 * 특정 관광지의 반려동물 정보를 캐시에서 조회
 * @param contentId - 관광지 ID
 * @returns PetTourInfo 또는 null (캐시에 없으면 undefined)
 */
export function getCachedPetTourInfo(
  contentId: string
): PetTourInfo | null | undefined {
  return petTourCache.get(contentId);
}

