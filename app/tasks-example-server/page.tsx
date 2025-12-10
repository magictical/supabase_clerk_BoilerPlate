/**
 * @file tasks-example-server/page.tsx
 * @description Clerk + Supabase 통합 예제 페이지 (Server Component)
 *
 * 이 페이지는 Server Component에서 Supabase를 사용하는 방법을 보여줍니다.
 * Supabase 공식 문서의 모범 사례를 따릅니다.
 *
 * 주요 특징:
 * 1. Server Component에서 데이터 페칭
 * 2. @supabase/ssr의 createServerClient 사용
 * 3. Clerk 토큰을 통한 인증
 *
 * @dependencies
 * - @supabase/ssr: Supabase SSR 클라이언트
 * - createClerkSupabaseClient: Clerk 토큰이 포함된 Supabase 클라이언트
 */

import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddTaskForm from './add-task-form';

interface Task {
  id: string;
  name: string;
  user_id: string;
  completed: boolean;
  created_at: string;
}

async function TasksList() {
  const supabase = await createClerkSupabaseClient();

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading tasks:', error);
    return (
      <div className="text-red-500">
        할 일을 불러오는 중 오류가 발생했습니다: {error.message}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        할 일이 없습니다. 아래에서 새 할 일을 추가해보세요!
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {(tasks as Task[]).map((task) => (
        <li
          key={task.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              checked={task.completed}
              disabled
              className="w-5 h-5"
            />
            <span
              className={
                task.completed
                  ? 'line-through text-gray-500 flex-1'
                  : 'flex-1'
              }
            >
              {task.name}
            </span>
          </div>
          <span className="text-sm text-gray-400">
            {new Date(task.created_at).toLocaleDateString('ko-KR')}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function TasksExampleServerPage() {
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">할 일 목록 (Server Component)</h1>
      <p className="text-gray-600 mb-6">
        이 페이지는 Server Component에서 Supabase를 사용하는 예제입니다.
        Supabase 공식 문서의 모범 사례를 따릅니다.
      </p>

      {/* 할 일 생성 폼 */}
      <div className="mb-8">
        <AddTaskForm />
      </div>

      {/* 할 일 목록 */}
      <Suspense fallback={<div className="text-center py-8">로딩 중...</div>}>
        <TasksList />
      </Suspense>

      {/* 정보 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm">
        <p className="font-semibold mb-2">Server Component 특징:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>서버에서 데이터를 미리 페칭하여 초기 로딩 시간 단축</li>
          <li>@supabase/ssr의 createServerClient 사용</li>
          <li>Next.js 15 App Router의 Suspense 지원</li>
          <li>SEO 최적화 (서버 사이드 렌더링)</li>
        </ul>
      </div>
    </div>
  );
}


