# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하는 방법을 설명합니다.

## 개요

이 프로젝트는 Clerk의 한국어 로컬라이제이션을 사용하여 모든 Clerk 컴포넌트를 한국어로 표시합니다.

- ✅ `@clerk/localizations` 패키지 사용
- ✅ 한국어(ko-KR) 로컬라이제이션 적용
- ✅ 커스텀 메시지 지원
- ✅ 에러 메시지 커스터마이징 가능

## 현재 설정

### 1. 패키지 설치

`@clerk/localizations` 패키지가 이미 설치되어 있습니다:

```json
{
  "dependencies": {
    "@clerk/localizations": "^3.26.3"
  }
}
```

### 2. 로컬라이제이션 적용

`app/layout.tsx`에서 한국어 로컬라이제이션을 적용합니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { customKoKR } from "@/lib/clerk/localization";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={customKoKR}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 3. 커스텀 로컬라이제이션 파일

`lib/clerk/localization.ts` 파일에서 커스텀 한국어 로컬라이제이션을 관리합니다:

```ts
import { koKR } from "@clerk/localizations";

export const customKoKR = {
  ...koKR,
  // 커스텀 메시지 추가 가능
};
```

## 커스터마이징 방법

### 기본 텍스트 수정

특정 Clerk 컴포넌트의 텍스트를 수정하려면 `lib/clerk/localization.ts` 파일을 수정하세요:

```ts
import { koKR } from "@clerk/localizations";

export const customKoKR = {
  ...koKR,
  signIn: {
    ...koKR.signIn,
    title: "커스텀 로그인 제목",
    subtitle: "계정에 로그인하세요",
  },
  signUp: {
    ...koKR.signUp,
    title: "커스텀 회원가입 제목",
    subtitle: "새 계정을 만드세요",
  },
};
```

### 에러 메시지 커스터마이징

에러 메시지를 커스터마이징하려면 `unstable__errors` 객체를 수정하세요:

```ts
export const customKoKR = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "접근이 허용되지 않은 이메일 도메인입니다. 회사 이메일 도메인을 허용 목록에 추가하려면 관리자에게 문의하세요.",
    form_identifier_not_found:
      "입력하신 이메일 또는 사용자 이름을 찾을 수 없습니다.",
    form_password_incorrect:
      "비밀번호가 올바르지 않습니다. 다시 시도해주세요.",
  },
};
```

### 사용 가능한 에러 키

전체 에러 키 목록은 다음 파일에서 확인할 수 있습니다:
- [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)
- `unstable__errors` 객체를 검색하여 사용 가능한 키를 확인하세요

## 지원되는 언어

Clerk는 다음 언어를 지원합니다 (한국어 포함):

| 언어 | 언어 태그 (BCP 47) | 키 |
|------|-------------------|-----|
| 한국어 | ko-KR | `koKR` |
| 영어 (미국) | en-US | `enUS` |
| 일본어 | ja-JP | `jaJP` |
| 중국어 (간체) | zh-CN | `zhCN` |
| 중국어 (번체) | zh-TW | `zhTW` |

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization#languages)를 참고하세요.

## 주의사항

### 실험적 기능

> ⚠️ **경고**: Clerk 로컬라이제이션 기능은 현재 실험적(experimental) 상태입니다.
> 예상치 못한 동작이 발생할 수 있으므로, 문제가 발생하면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요.

### 적용 범위

로컬라이제이션은 다음에만 적용됩니다:
- ✅ Clerk 컴포넌트 (SignIn, SignUp, UserButton 등)
- ✅ 클라이언트 사이드 UI

다음에는 적용되지 않습니다:
- ❌ Clerk Account Portal (호스팅된 사용자 관리 페이지는 영어로 유지)
- ❌ Clerk Dashboard (관리자 대시보드는 영어로 유지)

## 예제

### 기본 사용 (커스터마이징 없음)

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koKR}>
      {children}
    </ClerkProvider>
  );
}
```

### 커스텀 로컬라이제이션 사용

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { customKoKR } from "@/lib/clerk/localization";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={customKoKR}>
      {children}
    </ClerkProvider>
  );
}
```

## 문제 해결

### 로컬라이제이션이 적용되지 않는 경우

1. **패키지 설치 확인**
   ```bash
   pnpm list @clerk/localizations
   ```

2. **ClerkProvider 확인**
   - `localization` prop이 올바르게 전달되었는지 확인
   - `koKR` 또는 `customKoKR`이 올바르게 import되었는지 확인

3. **브라우저 캐시 삭제**
   - 개발 서버 재시작
   - 브라우저 캐시 및 쿠키 삭제

### 특정 텍스트가 번역되지 않는 경우

- 해당 텍스트가 Clerk 컴포넌트 내부의 텍스트인지 확인
- 커스텀 로컬라이제이션 파일에서 해당 키를 추가했는지 확인
- [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)에서 올바른 키를 찾았는지 확인

## 참고 자료

- [Clerk 공식 문서: 로컬라이제이션](https://clerk.com/docs/guides/customizing-clerk/localization)
- [Clerk JavaScript GitHub](https://github.com/clerk/javascript)
- [영어 로컬라이제이션 소스 코드](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)
- [한국어 로컬라이제이션 소스 코드](https://github.com/clerk/javascript/blob/main/packages/localizations/src/ko-KR.ts)

## 프로젝트 파일 구조

```
lib/
  clerk/
    localization.ts    # 커스텀 한국어 로컬라이제이션

app/
  layout.tsx           # ClerkProvider에 로컬라이제이션 적용
```

## 업데이트

로컬라이제이션을 업데이트하려면:

1. `@clerk/localizations` 패키지 업데이트
   ```bash
   pnpm update @clerk/localizations
   ```

2. `lib/clerk/localization.ts` 파일 확인
   - 새로운 키가 추가되었는지 확인
   - 커스텀 메시지가 여전히 유효한지 확인


