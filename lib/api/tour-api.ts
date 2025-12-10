/**
 * @file lib/api/tour-api.ts
 * @description 한국관광공사 Tour API 클라이언트
 *
 * 한국관광공사 공공 API를 호출하는 함수들을 제공합니다.
 * Base URL: https://apis.data.go.kr/B551011/KorService2
 *
 * 주요 기능:
 * - 지역코드 조회
 * - 지역 기반 관광지 목록 조회
 * - 키워드 검색
 * - 관광지 상세 정보 조회
 * - 에러 처리 및 재시도 로직
 *
 * @see {@link docs/PRD.md} - API 명세 (4장)
 */

import type {
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  PetTourInfo,
  AreaCode,
  TourApiResponse,
} from '@/lib/types/tour';

/**
 * Tour API 커스텀 에러 클래스
 */
export class TourApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'TourApiError';
  }
}

/**
 * Base URL
 */
const BASE_URL = 'https://apis.data.go.kr/B551011/KorService2';

/**
 * 공통 파라미터 가져오기
 * @param isServerSide - 서버 사이드인지 여부 (기본값: false)
 * @returns 공통 파라미터 객체
 */
function getCommonParams(isServerSide = false): Record<string, string> {
  const serviceKey = isServerSide
    ? process.env.TOUR_API_KEY
    : process.env.NEXT_PUBLIC_TOUR_API_KEY;

  if (!serviceKey) {
    throw new TourApiError(
      `Tour API key is missing. Please check ${
        isServerSide ? 'TOUR_API_KEY' : 'NEXT_PUBLIC_TOUR_API_KEY'
      } environment variable.`
    );
  }

  return {
    serviceKey,
    MobileOS: 'ETC',
    MobileApp: 'MyTrip',
    _type: 'json',
  };
}

/**
 * API 호출 재시도 로직
 * @param fn - 실행할 함수
 * @param maxRetries - 최대 재시도 횟수 (기본값: 3)
 * @returns 함수 실행 결과
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 마지막 시도가 아니면 재시도
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 지수 백오프: 1초, 2초, 4초
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError!;
}

/**
 * API 호출 함수
 * @param endpoint - API 엔드포인트
 * @param params - 쿼리 파라미터
 * @param isServerSide - 서버 사이드인지 여부
 * @returns API 응답 데이터 및 메타데이터
 */
async function fetchTourApi<T>(
  endpoint: string,
  params: Record<string, string | number | undefined>,
  isServerSide = false
): Promise<{ data: T; totalCount: number }> {
  const commonParams = getCommonParams(isServerSide);
  const allParams = { ...commonParams, ...params };

  // undefined 값 제거
  const queryParams = new URLSearchParams();
  Object.entries(allParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 }, // 1시간 캐싱
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new TourApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: TourApiResponse<T> = await response.json();

    // API 응답 에러 확인
    if (data.response.header.resultCode !== '0000') {
      throw new TourApiError(
        `API error: ${data.response.header.resultMsg}`,
        undefined,
        data
      );
    }

    // 응답 데이터 추출
    const items = data.response.body.items?.item;
    const totalCount = data.response.body.totalCount || 0;

    // 데이터가 없는 경우
    if (!items) {
      return { data: [] as T, totalCount: 0 };
    }

    // 배열이 아닌 경우 배열로 변환
    const dataArray = Array.isArray(items) ? items : [items];

    return {
      data: dataArray as T,
      totalCount,
    };
  } catch (error) {
    if (error instanceof TourApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new TourApiError('Request timeout', 408);
    }

    throw new TourApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * 지역코드 조회
 * @param numOfRows - 한 페이지 결과 수 (기본값: 100)
 * @param pageNo - 페이지 번호 (기본값: 1)
 * @param isServerSide - 서버 사이드인지 여부
 * @returns 지역 코드 목록
 */
export async function getAreaCode(
  numOfRows = 100,
  pageNo = 1,
  isServerSide = false
): Promise<AreaCode[]> {
  const result = await withRetry(() =>
    fetchTourApi<AreaCode[]>(
      '/areaCode2',
      { numOfRows, pageNo },
      isServerSide
    )
  );
  return result.data;
}

/**
 * 지역 기반 관광지 목록 조회
 * @param options - 조회 옵션
 * @param isServerSide - 서버 사이드인지 여부
 * @returns 관광지 목록 및 전체 개수
 */
export async function getAreaBasedList(
  options: {
    areaCode?: string;
    contentTypeId?: string;
    numOfRows?: number;
    pageNo?: number;
    arrange?: 'A' | 'B' | 'C' | 'D'; // A: 제목순, B: 조회순, C: 수정일순, D: 거리순
  } = {},
  isServerSide = false
): Promise<{ items: TourItem[]; totalCount: number }> {
  const result = await withRetry(() =>
    fetchTourApi<TourItem[]>(
      '/areaBasedList2',
      {
        areaCode: options.areaCode,
        contentTypeId: options.contentTypeId,
        numOfRows: options.numOfRows || 20,
        pageNo: options.pageNo || 1,
        arrange: options.arrange || 'C', // 기본값: 수정일순
      },
      isServerSide
    )
  );

  return {
    items: Array.isArray(result.data) ? result.data : [],
    totalCount: result.totalCount,
  };
}

/**
 * 키워드 검색
 * @param keyword - 검색 키워드
 * @param options - 검색 옵션
 * @param isServerSide - 서버 사이드인지 여부
 * @returns 검색 결과 목록 및 전체 개수
 */
export async function searchKeyword(
  keyword: string,
  options: {
    areaCode?: string;
    contentTypeId?: string;
    numOfRows?: number;
    pageNo?: number;
  } = {},
  isServerSide = false
): Promise<{ items: TourItem[]; totalCount: number }> {
  if (!keyword.trim()) {
    return { items: [], totalCount: 0 };
  }

  const result = await withRetry(() =>
    fetchTourApi<TourItem[]>(
      '/searchKeyword2',
      {
        keyword: keyword.trim(),
        areaCode: options.areaCode,
        contentTypeId: options.contentTypeId,
        numOfRows: options.numOfRows || 20,
        pageNo: options.pageNo || 1,
      },
      isServerSide
    )
  );

  return {
    items: Array.isArray(result.data) ? result.data : [],
    totalCount: result.totalCount,
  };
}

/**
 * 관광지 공통 정보 조회
 * @param contentId - 콘텐츠ID
 * @param options - 조회 옵션
 * @param isServerSide - 서버 사이드인지 여부
 * @returns 관광지 상세 정보
 */
export async function getDetailCommon(
  contentId: string,
  options: {
    defaultYN?: 'Y' | 'N';
    firstImageYN?: 'Y' | 'N';
    areacodeYN?: 'Y' | 'N';
    catcodeYN?: 'Y' | 'N';
    addrinfoYN?: 'Y' | 'N';
    mapinfoYN?: 'Y' | 'N';
    overviewYN?: 'Y' | 'N';
  } = {},
  isServerSide = false
): Promise<TourDetail> {
  const result = await withRetry(() =>
    fetchTourApi<TourDetail>(
      '/detailCommon2',
      {
        contentId,
        defaultYN: options.defaultYN || 'Y',
        firstImageYN: options.firstImageYN || 'Y',
        areacodeYN: options.areacodeYN || 'Y',
        catcodeYN: options.catcodeYN || 'Y',
        addrinfoYN: options.addrinfoYN || 'Y',
        mapinfoYN: options.mapinfoYN || 'Y',
        overviewYN: options.overviewYN || 'Y',
      },
      isServerSide
    )
  );

  const details = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!details) {
    throw new TourApiError(`Tour detail not found for contentId: ${contentId}`);
  }

  return details;
}

/**
 * 관광지 소개 정보 조회
 * @param contentId - 콘텐츠ID
 * @param contentTypeId - 콘텐츠타입ID
 * @param isServerSide - 서버 사이드인지 여부
 * @returns 관광지 운영 정보
 */
export async function getDetailIntro(
  contentId: string,
  contentTypeId: string,
  isServerSide = false
): Promise<TourIntro> {
  const result = await withRetry(() =>
    fetchTourApi<TourIntro>(
      '/detailIntro2',
      {
        contentId,
        contentTypeId,
      },
      isServerSide
    )
  );

  const intro = Array.isArray(result.data) ? result.data[0] : result.data;
  if (!intro) {
    throw new TourApiError(
      `Tour intro not found for contentId: ${contentId}`
    );
  }

  return intro;
}

/**
 * 관광지 이미지 목록 조회
 * @param contentId - 콘텐츠ID
 * @param options - 조회 옵션
 * @param isServerSide - 서버 사이드인지 여부
 * @returns 이미지 목록
 */
export async function getDetailImage(
  contentId: string,
  options: {
    imageYN?: 'Y' | 'N';
    subImageYN?: 'Y' | 'N';
  } = {},
  isServerSide = false
): Promise<TourImage[]> {
  const result = await withRetry(() =>
    fetchTourApi<TourImage[]>(
      '/detailImage2',
      {
        contentId,
        imageYN: options.imageYN || 'Y',
        subImageYN: options.subImageYN || 'Y',
      },
      isServerSide
    )
  );

  return Array.isArray(result.data) ? result.data : [];
}

/**
 * 반려동물 동반 여행 정보 조회
 * @param contentId - 콘텐츠ID
 * @param isServerSide - 서버 사이드인지 여부
 * @returns 반려동물 정보 (없으면 null)
 */
export async function getDetailPetTour(
  contentId: string,
  isServerSide = false
): Promise<PetTourInfo | null> {
  try {
    const result = await withRetry(() =>
      fetchTourApi<PetTourInfo>(
        '/detailPetTour2',
        { contentId },
        isServerSide
      )
    );

    const petInfo = Array.isArray(result.data) ? result.data[0] : result.data;
    return petInfo || null;
  } catch (error) {
    // 반려동물 정보가 없는 경우 null 반환
    if (error instanceof TourApiError) {
      return null;
    }
    throw error;
  }
}

