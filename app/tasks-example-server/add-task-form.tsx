'use client';

/**
 * @file tasks-example-server/add-task-form.tsx
 * @description 할 일 추가 폼 (Client Component)
 *
 * Server Component에서 사용하는 Client Component 폼입니다.
 * Server Action을 사용하여 데이터를 생성합니다.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addTask } from './actions';

export default function AddTaskForm() {
  const router = useRouter();
  const [taskName, setTaskName] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!taskName.trim()) {
      return;
    }

    startTransition(async () => {
      try {
        await addTask(taskName.trim());
        setTaskName('');
        router.refresh(); // Server Component 재렌더링
      } catch (error) {
        console.error('Error adding task:', error);
        alert('할 일 추가에 실패했습니다.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="새 할 일을 입력하세요..."
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          disabled={isPending}
          className="flex-1"
        />
        <Button type="submit" disabled={isPending || !taskName.trim()}>
          {isPending ? '추가 중...' : '추가'}
        </Button>
      </div>
    </form>
  );
}



