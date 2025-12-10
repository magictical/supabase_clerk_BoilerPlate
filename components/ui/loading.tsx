/**
 * @file components/ui/loading.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 데이터 로딩 중 표시할 스피너 컴포넌트입니다.
 * 다양한 크기와 텍스트 옵션을 지원합니다.
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  /** 크기 (sm, md, lg) */
  size?: 'sm' | 'md' | 'lg';
  /** 로딩 텍스트 */
  text?: string;
  /** 추가 클래스명 */
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Loading({ size = 'md', text, className }: LoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        className
      )}
    >
      <Loader2
        className={cn('animate-spin text-primary', sizeClasses[size])}
      />
      {text && (
        <p className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * 전체 화면 로딩 컴포넌트
 */
export function FullScreenLoading({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" text={text || '로딩 중...'} />
    </div>
  );
}


