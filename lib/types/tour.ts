/**
 * @file lib/types/tour.ts
 * @description 한국관광공사 Tour API 관련 TypeScript 타입 정의
 *
 * 이 파일은 한국관광공사 Tour API의 응답 데이터 구조를 정의합니다.
 * PRD 문서의 5장 "데이터 구조" 섹션을 참고하여 작성되었습니다.
 *
 * @see {@link docs/PRD.md} - API 명세 및 데이터 구조
 */

/**
 * 관광지 목록 항목 (areaBasedList2, searchKeyword2 응답)
 * @see PRD 5.1
 */
export interface TourItem {
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 지역코드 */
  areacode: string;
  /** 콘텐츠ID (고유 식별자) */
  contentid: string;
  /** 콘텐츠타입ID (12: 관광지, 14: 문화시설, 15: 축제/행사, 25: 여행코스, 28: 레포츠, 32: 숙박, 38: 쇼핑, 39: 음식점) */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 경도 (KATEC 좌표계, 정수형) - 10000000으로 나누어 변환 필요 */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형) - 10000000으로 나누어 변환 필요 */
  mapy: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 전화번호 */
  tel?: string;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
  /** 수정일 (YYYYMMDDHHmmss 형식) */
  modifiedtime: string;
}

/**
 * 관광지 상세 정보 (detailCommon2 응답)
 * @see PRD 5.2
 */
export interface TourDetail {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 우편번호 */
  zipcode?: string;
  /** 전화번호 */
  tel?: string;
  /** 홈페이지 URL */
  homepage?: string;
  /** 개요 (긴 설명문) */
  overview?: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 경도 (KATEC 좌표계) */
  mapx: string;
  /** 위도 (KATEC 좌표계) */
  mapy: string;
}

/**
 * 관광지 운영 정보 (detailIntro2 응답)
 * @see PRD 5.3
 *
 * 타입별로 필드가 다르므로 모든 필드를 선택적 필드로 정의합니다.
 */
export interface TourIntro {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 이용시간 */
  usetime?: string;
  /** 휴무일 */
  restdate?: string;
  /** 문의처 */
  infocenter?: string;
  /** 주차 가능 여부 */
  parking?: string;
  /** 반려동물 동반 가능 여부 */
  chkpet?: string;
  /** 수용인원 */
  accomcount?: string;
  /** 체험 프로그램 */
  expguide?: string;
  /** 유모차 대여 */
  chkbabycarriage?: string;
  /** 이용요금 */
  usefee?: string;
  /** 할인정보 */
  discountinfo?: string;
  /** 예약안내 */
  reservation?: string;
  /** 기타 정보 */
  [key: string]: string | undefined;
}

/**
 * 관광지 이미지 정보 (detailImage2 응답)
 */
export interface TourImage {
  /** 콘텐츠ID */
  contentid: string;
  /** 이미지명 */
  imgname?: string;
  /** 원본 이미지 URL */
  originimgurl: string;
  /** 썸네일 이미지 URL */
  smallimageurl?: string;
  /** 일련번호 */
  serialnum?: string;
}

/**
 * 반려동물 동반 여행 정보 (detailPetTour2 응답)
 * @see PRD 5.3
 */
export interface PetTourInfo {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 애완동물 동반 여부 */
  chkpetleash?: string;
  /** 애완동물 크기 제한 */
  chkpetsize?: string;
  /** 입장 가능 장소 (실내/실외) */
  chkpetplace?: string;
  /** 추가 요금 */
  chkpetfee?: string;
  /** 기타 반려동물 정보 */
  petinfo?: string;
  /** 주차장 정보 */
  parking?: string;
}

/**
 * 지역 코드 정보 (areaCode2 응답)
 */
export interface AreaCode {
  /** 지역 코드 */
  code: string;
  /** 지역명 */
  name: string;
  /** 순번 */
  rnum?: string;
}

/**
 * 한국관광공사 API 공통 응답 구조
 * @template T - 응답 데이터 타입
 */
export interface TourApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * Content Type ID 상수
 * @see PRD 4.4
 */
export const CONTENT_TYPE = {
  TOURIST_SPOT: '12', // 관광지
  CULTURAL_FACILITY: '14', // 문화시설
  FESTIVAL: '15', // 축제/행사
  TOUR_COURSE: '25', // 여행코스
  LEISURE_SPORTS: '28', // 레포츠
  ACCOMMODATION: '32', // 숙박
  SHOPPING: '38', // 쇼핑
  RESTAURANT: '39', // 음식점
} as const;

/**
 * Content Type ID 타입
 */
export type ContentTypeId =
  | typeof CONTENT_TYPE.TOURIST_SPOT
  | typeof CONTENT_TYPE.CULTURAL_FACILITY
  | typeof CONTENT_TYPE.FESTIVAL
  | typeof CONTENT_TYPE.TOUR_COURSE
  | typeof CONTENT_TYPE.LEISURE_SPORTS
  | typeof CONTENT_TYPE.ACCOMMODATION
  | typeof CONTENT_TYPE.SHOPPING
  | typeof CONTENT_TYPE.RESTAURANT;

/**
 * Content Type 이름 매핑
 */
export const CONTENT_TYPE_NAMES: Record<ContentTypeId, string> = {
  [CONTENT_TYPE.TOURIST_SPOT]: '관광지',
  [CONTENT_TYPE.CULTURAL_FACILITY]: '문화시설',
  [CONTENT_TYPE.FESTIVAL]: '축제/행사',
  [CONTENT_TYPE.TOUR_COURSE]: '여행코스',
  [CONTENT_TYPE.LEISURE_SPORTS]: '레포츠',
  [CONTENT_TYPE.ACCOMMODATION]: '숙박',
  [CONTENT_TYPE.SHOPPING]: '쇼핑',
  [CONTENT_TYPE.RESTAURANT]: '음식점',
};


