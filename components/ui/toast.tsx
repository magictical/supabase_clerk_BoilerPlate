/**
 * @file components/ui/toast.tsx
 * @description Toast 알림 컴포넌트 및 유틸리티
 *
 * sonner를 사용한 Toast 알림 기능을 제공합니다.
 * 성공, 에러, 정보, 경고 타입의 토스트를 표시할 수 있습니다.
 */

'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * Toast Provider 컴포넌트
 * app/layout.tsx에 추가해야 합니다.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }}
    />
  );
}

/**
 * Toast 유틸리티 함수
 * 클라이언트 컴포넌트에서 import하여 사용합니다.
 */
export { toast } from 'sonner';


