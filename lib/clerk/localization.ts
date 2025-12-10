/**
 * @file lib/clerk/localization.ts
 * @description Clerk 한국어 로컬라이제이션 설정
 *
 * 이 파일은 Clerk 컴포넌트의 한국어 번역을 관리합니다.
 * 기본 koKR 로컬라이제이션을 확장하여 커스텀 메시지를 추가할 수 있습니다.
 *
 * 참고: Clerk 로컬라이제이션은 현재 실험적(experimental) 기능입니다.
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */

import { koKR } from "@clerk/localizations";

/**
 * 커스텀 한국어 로컬라이제이션
 *
 * 기본 koKR 로컬라이제이션을 확장하여 프로젝트에 맞게 커스터마이징합니다.
 * 필요한 경우 여기서 텍스트를 수정하거나 추가할 수 있습니다.
 */
export const customKoKR = {
  ...koKR,
  // 필요시 특정 텍스트를 커스터마이징할 수 있습니다
  // 예시:
  // signIn: {
  //   ...koKR.signIn,
  //   title: "커스텀 로그인 제목",
  // },
  // signUp: {
  //   ...koKR.signUp,
  //   title: "커스텀 회원가입 제목",
  // },

  /**
   * 에러 메시지 커스터마이징
   *
   * Clerk의 기본 에러 메시지를 한국어로 커스터마이징합니다.
   * 전체 에러 키 목록은 다음 파일에서 확인할 수 있습니다:
   * https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts
   */
  unstable__errors: {
    ...koKR.unstable__errors,
    // 예시: 접근이 허용되지 않은 이메일 도메인에 대한 커스텀 메시지
    // not_allowed_access:
    //   "접근이 허용되지 않은 이메일 도메인입니다. 회사 이메일 도메인을 허용 목록에 추가하려면 관리자에게 문의하세요.",
  },
};

/**
 * 기본 한국어 로컬라이제이션 (커스터마이징 없이 사용)
 *
 * 커스터마이징이 필요 없는 경우 이 값을 사용하세요.
 */
export { koKR as defaultKoKR };



