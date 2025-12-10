import { createServerClient } from "@supabase/ssr";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component용)
 *
 * Supabase 공식 문서의 모범 사례를 따릅니다:
 * - @supabase/ssr의 createServerClient 사용
 * - Next.js 15 App Router의 cookies() API 활용
 * - Clerk 토큰을 accessToken() 함수로 전달
 *
 * 2025년 4월부터 권장되는 방식:
 * - JWT 템플릿 불필요
 * - Clerk 토큰을 Supabase가 자동 검증
 * - auth().getToken()으로 현재 세션 토큰 사용
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = await createClerkSupabaseClient();
 *   const { data } = await supabase.from('table').select('*');
 *   return <div>...</div>;
 * }
 * ```
 */
export async function createClerkSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Server Component는 read-only이므로 쿠키 설정은 경고만 발생
        // 실제 쿠키 설정은 Middleware나 Route Handler에서 처리
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Server Component에서는 쿠키 설정이 제한될 수 있음
          // Middleware에서 세션 갱신을 처리하는 것이 권장됨
        }
      },
    },
    async accessToken() {
      // 서버 사이드에서 Clerk 세션 토큰 가져오기
      // Supabase가 이 토큰을 검증하여 사용자 인증 처리
      return (await auth()).getToken() ?? null;
    },
  });
}
