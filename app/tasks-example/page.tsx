'use client';

/**
 * @file tasks-example/page.tsx
 * @description Clerk + Supabase 통합 예제 페이지
 *
 * 이 페이지는 Clerk와 Supabase의 네이티브 통합을 보여주는 완전한 예제입니다.
 * 사용자는 자신의 할 일 목록을 생성, 조회, 삭제할 수 있습니다.
 *
 * 주요 기능:
 * 1. Clerk 인증 상태 확인
 * 2. Supabase를 통한 데이터 CRUD 작업
 * 3. 실시간 데이터 동기화
 *
 * @dependencies
 * - @clerk/nextjs: Clerk 인증 훅
 * - @supabase/ssr: Supabase SSR 클라이언트 (공식 모범 사례)
 * - useClerkSupabaseClient: Clerk 토큰이 포함된 Supabase 클라이언트
 */

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Task {
  id: string;
  name: string;
  user_id: string;
  completed: boolean;
  created_at: string;
}

export default function TasksExamplePage() {
  const { user, isLoaded } = useUser();
  const supabase = useClerkSupabaseClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskName, setTaskName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 할 일 목록 로드
  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    async function loadTasks() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading tasks:', error);
          return;
        }

        if (data) {
          setTasks(data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [user, isLoaded, supabase]);

  // 새 할 일 생성
  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!taskName.trim() || !user) {
      return;
    }

    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          name: taskName.trim(),
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        alert('할 일 생성에 실패했습니다: ' + error.message);
        return;
      }

      if (data) {
        setTasks([data, ...tasks]);
        setTaskName('');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('예상치 못한 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  // 할 일 삭제
  async function handleDeleteTask(taskId: string) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        alert('할 일 삭제에 실패했습니다: ' + error.message);
        return;
      }

      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('예상치 못한 오류가 발생했습니다.');
    }
  }

  // 할 일 완료 상태 토글
  async function handleToggleComplete(taskId: string, currentStatus: boolean) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        alert('할 일 업데이트에 실패했습니다: ' + error.message);
        return;
      }

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        )
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('예상치 못한 오류가 발생했습니다.');
    }
  }

  // 로딩 중
  if (!isLoaded) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">할 일 목록</h1>
          <p className="text-gray-600">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">할 일 목록</h1>
      <p className="text-gray-600 mb-6">
        안녕하세요, {user.firstName || user.emailAddresses[0]?.emailAddress}님!
      </p>

      {/* 할 일 생성 폼 */}
      <form onSubmit={handleCreateTask} className="mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="새 할 일을 입력하세요..."
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            disabled={submitting}
            className="flex-1"
          />
          <Button type="submit" disabled={submitting || !taskName.trim()}>
            {submitting ? '추가 중...' : '추가'}
          </Button>
        </div>
      </form>

      {/* 할 일 목록 */}
      {loading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          할 일이 없습니다. 위에서 새 할 일을 추가해보세요!
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task.id, task.completed)}
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
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteTask(task.id)}
              >
                삭제
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* 디버깅 정보 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <p className="font-semibold mb-2">디버깅 정보:</p>
          <p>사용자 ID: {user.id}</p>
          <p>할 일 개수: {tasks.length}</p>
        </div>
      )}
    </div>
  );
}

