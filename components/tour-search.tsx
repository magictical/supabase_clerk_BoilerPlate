/**
 * @file components/tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 키워드로 관광지를 검색할 수 있는 검색창 UI를 제공합니다.
 * 엔터 키 또는 검색 버튼 클릭으로 검색을 실행합니다.
 *
 * @see {@link docs/PRD.md} - MVP 2.3 키워드 검색 요구사항
 */

"use client";

import { useState, FormEvent, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";

interface TourSearchProps {
  /** 현재 검색 키워드 */
  keyword?: string;
  /** 검색 실행 콜백 */
  onSearch: (keyword: string) => void;
  /** 검색 중 여부 */
  isLoading?: boolean;
}

export function TourSearch({
  keyword: initialKeyword = "",
  onSearch,
  isLoading = false,
}: TourSearchProps) {
  const [keyword, setKeyword] = useState(initialKeyword);

  // 초기 키워드가 변경되면 내부 상태 업데이트 (URL에서 파싱된 경우)
  useEffect(() => {
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(keyword.trim());
  };

  const handleClear = () => {
    setKeyword("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="관광지명, 주소, 설명으로 검색..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10 pr-10 min-w-[300px]"
            disabled={isLoading}
            aria-label="검색어 입력"
          />
          {keyword && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground transition-colors"
              aria-label="검색어 지우기"
              disabled={isLoading}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={isLoading || !keyword.trim()}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loading size="sm" />
              <span>검색 중...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>검색</span>
            </div>
          )}
        </Button>
      </div>
    </form>
  );
}

