# Clerk + Supabase 통합 가이드

이 문서는 Clerk와 Supabase를 최신 모범 사례에 따라 통합하는 방법을 설명합니다.

## 개요

이 프로젝트는 **2025년 4월 이후 권장되는 네이티브 통합 방식**을 사용합니다:

- ✅ JWT 템플릿 불필요 (deprecated)
- ✅ Clerk 세션 토큰을 직접 사용
- ✅ Supabase의 third-party auth provider 기능 활용
- ✅ 더 빠른 응답 시간 (토큰 재생성 불필요)

## 1. Clerk 대시보드 설정

### 1.1 Supabase 통합 활성화

1. [Clerk Dashboard](https://dashboard.clerk.com)에 로그인
2. **Integrations** → **Supabase**로 이동
3. **Activate Supabase integration** 클릭
4. **Clerk domain** 복사 (예: `your-app.clerk.accounts.dev`)

### 1.2 Clerk Domain 확인

Clerk Dashboard의 **Settings** → **Domains**에서 확인할 수 있습니다.

## 2. Supabase 대시보드 설정

### 2.1 Clerk를 Third-Party Auth Provider로 추가

1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Authentication** → **Providers** → **Third-Party Auth**로 이동
4. **Add provider** 클릭
5. **Clerk** 선택
6. 1.1에서 복사한 **Clerk domain** 입력
7. **Save** 클릭

### 2.2 확인 사항

- Clerk 통합이 활성화되면 Supabase가 Clerk 세션 토큰을 자동으로 검증합니다
- `auth.jwt()->>'sub'`로 Clerk 사용자 ID에 접근할 수 있습니다

## 3. 환경 변수 설정

`.env` 파일에 다음 환경 변수가 설정되어 있는지 확인하세요:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # 서버 사이드 전용
```

## 4. Supabase 클라이언트 사용법

> **참고**: 이 프로젝트는 Supabase 공식 문서의 모범 사례를 따릅니다.
>
> - `@supabase/ssr` 패키지 사용
> - Server Component: `createServerClient` 사용
> - Client Component: `createBrowserClient` 사용
> - Clerk 토큰은 `accessToken()` 함수로 전달

### 4.1 Client Component에서 사용

Client Component에서는 `useClerkSupabaseClient` 훅을 사용합니다. 내부적으로 `@supabase/ssr`의 `createBrowserClient`를 사용합니다:

```tsx
"use client";

import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useUser } from "@clerk/nextjs";

export default function MyComponent() {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();

  async function fetchData() {
    if (!user) return;

    const { data, error } = await supabase.from("tasks").select("*");

    if (error) {
      console.error("Error:", error);
      return;
    }

    return data;
  }

  return <div>...</div>;
}
```

### 4.2 Server Component에서 사용

Server Component에서는 `createClerkSupabaseClient` 함수를 사용합니다. 내부적으로 `@supabase/ssr`의 `createServerClient`를 사용하며, Next.js 15의 `cookies()` API를 활용합니다:

> **중요**: Server Component에서는 `await createClerkSupabaseClient()`로 호출해야 합니다.

```tsx
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function TasksList() {
  const supabase = await createClerkSupabaseClient();

  const { data, error } = await supabase.from("tasks").select("*");

  if (error) {
    throw error;
  }

  return (
    <div>
      {data?.map((task) => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}

export default async function MyPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <TasksList />
    </Suspense>
  );
}
```

### 4.3 Server Action에서 사용

Server Action에서도 동일한 함수를 사용합니다. `revalidatePath`를 사용하여 페이지를 재검증할 수 있습니다:

```ts
"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createTask(name: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClerkSupabaseClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert({ name, user_id: userId });

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  // 페이지 재검증
  revalidatePath("/tasks");

  return data;
}
```

### 4.4 관리자 권한 작업 (Service Role)

RLS를 우회해야 하는 경우에만 사용합니다:

```ts
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function adminOperation() {
  const supabase = getServiceRoleClient();

  // RLS 정책을 우회하여 모든 데이터에 접근
  const { data } = await supabase.from("users").select("*");

  return data;
}
```

⚠️ **주의**: Service Role Key는 절대 클라이언트에 노출되면 안 됩니다!

## 5. 데이터베이스 스키마 및 RLS 정책

### 5.1 개발 환경 (RLS 비활성화)

개발 환경에서는 RLS를 비활성화하여 빠른 개발을 진행할 수 있습니다:

```sql
-- 테이블 생성
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL, -- Clerk user ID 저장
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 개발 중에는 RLS 비활성화
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

### 5.2 프로덕션 환경 (RLS 활성화)

프로덕션 환경에서는 반드시 RLS를 활성화하고 정책을 설정해야 합니다:

```sql
-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 작업만 조회 가능
CREATE POLICY "Users can view their own tasks"
ON tasks
FOR SELECT
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- 사용자는 자신의 작업만 생성 가능
CREATE POLICY "Users can insert their own tasks"
ON tasks
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- 사용자는 자신의 작업만 수정 가능
CREATE POLICY "Users can update their own tasks"
ON tasks
FOR UPDATE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
)
WITH CHECK (
  (SELECT auth.jwt()->>'sub') = user_id
);

-- 사용자는 자신의 작업만 삭제 가능
CREATE POLICY "Users can delete their own tasks"
ON tasks
FOR DELETE
TO authenticated
USING (
  (SELECT auth.jwt()->>'sub') = user_id
);
```

### 5.3 RLS 정책 설명

- `auth.jwt()->>'sub'`: Clerk 세션 토큰에서 사용자 ID를 추출
- `TO authenticated`: 인증된 사용자에게만 적용
- `USING`: SELECT, UPDATE, DELETE 시 조건 검사
- `WITH CHECK`: INSERT, UPDATE 시 조건 검사

## 6. 예제: Tasks 애플리케이션

두 가지 예제가 제공됩니다:

1. **Client Component 예제**: `app/tasks-example/page.tsx`

   - 클라이언트 사이드에서 데이터 페칭
   - 실시간 업데이트 가능

2. **Server Component 예제**: `app/tasks-example-server/page.tsx`
   - 서버 사이드에서 데이터 페칭
   - SEO 최적화
   - Supabase 공식 문서의 모범 사례를 따름

### 6.1 테이블 생성

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT (SELECT auth.jwt()->>'sub'),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 개발 환경: RLS 비활성화
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
```

### 6.2 Client Component 예제

```tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";

export default function TasksPage() {
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadTasks() {
      setLoading(true);
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTasks(data);
      }
      setLoading(false);
    }

    loadTasks();
  }, [user, supabase]);

  async function createTask(name: string) {
    const { data, error } = await supabase.from("tasks").insert({ name });

    if (!error && data) {
      setTasks([...tasks, ...data]);
    }
  }

  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div>
      <h1>할 일 목록</h1>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 7. 문제 해결

### 7.1 "Invalid JWT" 오류

- Clerk 대시보드에서 Supabase 통합이 활성화되어 있는지 확인
- Supabase 대시보드에서 Clerk provider가 추가되어 있는지 확인
- Clerk domain이 올바르게 입력되었는지 확인

### 7.2 RLS 정책 오류

- 개발 환경에서는 RLS를 비활성화하세요
- 프로덕션 환경에서는 RLS 정책이 올바르게 설정되었는지 확인하세요
- `auth.jwt()->>'sub'`가 올바르게 작동하는지 확인하세요

### 7.3 토큰이 전달되지 않는 경우

- `accessToken()` 함수가 올바르게 구현되었는지 확인
- Client Component에서는 `useClerkSupabaseClient` 사용
- Server Component에서는 `createClerkSupabaseClient` 사용

## 8. 참고 자료

### 공식 문서

- [Clerk 공식 문서: Supabase 통합](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Supabase 공식 문서: Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase 공식 문서: Third-Party Auth](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Supabase 공식 문서: Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase SSR 문서](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

### 프로젝트 예제

- Client Component 예제: `app/tasks-example/page.tsx`
- Server Component 예제: `app/tasks-example-server/page.tsx`

## 9. 마이그레이션 가이드 (JWT 템플릿에서 네이티브 통합으로)

기존에 JWT 템플릿을 사용하던 프로젝트를 네이티브 통합으로 마이그레이션하는 방법:

1. **Clerk 대시보드에서 Supabase 통합 활성화**
2. **Supabase 대시보드에서 Clerk provider 추가**
3. **코드 업데이트**: `accessToken()` 함수 사용
4. **JWT 템플릿 제거**: 더 이상 필요하지 않음
5. **테스트**: 모든 기능이 정상 작동하는지 확인

장점:

- 더 빠른 응답 시간
- 보안 강화 (JWT secret 공유 불필요)
- 유지보수 간소화
