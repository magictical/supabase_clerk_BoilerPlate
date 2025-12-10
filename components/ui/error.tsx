/**
 * @file components/ui/error.tsx
 * @description 에러 메시지 표시 컴포넌트
 *
 * API 에러나 기타 에러를 사용자 친화적으로 표시하는 컴포넌트입니다.
 * 재시도 버튼을 포함할 수 있습니다.
 */

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorProps {
  /** 에러 메시지 */
  message?: string;
  /** 재시도 함수 */
  onRetry?: () => void;
  /** 재시도 버튼 텍스트 */
  retryText?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 전체 화면 표시 여부 */
  fullScreen?: boolean;
}

export function Error({
  message = '오류가 발생했습니다.',
  onRetry,
  retryText = '다시 시도',
  className,
  fullScreen = false,
}: ErrorProps) {
  const containerClass = fullScreen
    ? 'flex items-center justify-center min-h-[400px]'
    : '';

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', containerClass, className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg font-semibold text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">
          잠시 후 다시 시도해주세요.
        </p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          {retryText}
        </Button>
      )}
    </div>
  );
}


