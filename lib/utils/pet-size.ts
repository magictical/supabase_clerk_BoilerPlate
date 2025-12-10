/**
 * @file lib/utils/pet-size.ts
 * @description 반려동물 크기 관련 유틸리티 함수
 *
 * API 응답의 크기 문자열을 내부 타입으로 변환하고,
 * 한글 표시를 위한 변환 함수를 제공합니다.
 */

/**
 * 반려동물 크기 타입
 */
export type PetSize = 'small' | 'medium' | 'large';

/**
 * API 응답의 크기 문자열을 PetSize로 변환
 * @param sizeStr - API 응답 크기 문자열 (예: "소형", "중형", "대형", "소형견 가능" 등)
 * @returns PetSize 또는 null
 */
export function parsePetSize(sizeStr?: string): PetSize | null {
  if (!sizeStr) return null;

  const normalized = sizeStr.trim().toLowerCase();

  // 소형 관련 키워드
  if (
    normalized.includes('소형') ||
    normalized.includes('소') ||
    normalized.includes('small')
  ) {
    return 'small';
  }

  // 중형 관련 키워드
  if (
    normalized.includes('중형') ||
    normalized.includes('중') ||
    normalized.includes('medium')
  ) {
    return 'medium';
  }

  // 대형 관련 키워드
  if (
    normalized.includes('대형') ||
    normalized.includes('대') ||
    normalized.includes('large')
  ) {
    return 'large';
  }

  return null;
}

/**
 * PetSize를 한글 문자열로 변환
 * @param size - PetSize 타입
 * @returns 한글 크기 문자열
 */
export function petSizeToKorean(size: PetSize): string {
  const map: Record<PetSize, string> = {
    small: '소형',
    medium: '중형',
    large: '대형',
  };
  return map[size];
}

/**
 * PetSize 배열을 한글 문자열 배열로 변환
 * @param sizes - PetSize 배열
 * @returns 한글 크기 문자열 배열
 */
export function petSizesToKorean(sizes: PetSize[]): string[] {
  return sizes.map(petSizeToKorean);
}

