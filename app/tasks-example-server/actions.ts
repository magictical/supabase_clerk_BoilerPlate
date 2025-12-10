'use server';

/**
 * @file tasks-example-server/actions.ts
 * @description Server Actions for Tasks
 *
 * Server Action을 사용하여 데이터를 생성, 수정, 삭제합니다.
 * Supabase 공식 문서의 모범 사례를 따릅니다.
 */

import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

export async function addTask(name: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClerkSupabaseClient();

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      name,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add task: ${error.message}`);
  }

  // 페이지 재검증
  revalidatePath('/tasks-example-server');

  return data;
}

export async function updateTask(taskId: string, completed: boolean) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClerkSupabaseClient();

  const { error } = await supabase
    .from('tasks')
    .update({ completed })
    .eq('id', taskId)
    .eq('user_id', userId); // 자신의 작업만 수정 가능

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }

  revalidatePath('/tasks-example-server');

  return { success: true };
}

export async function deleteTask(taskId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClerkSupabaseClient();

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId); // 자신의 작업만 삭제 가능

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`);
  }

  revalidatePath('/tasks-example-server');

  return { success: true };
}



