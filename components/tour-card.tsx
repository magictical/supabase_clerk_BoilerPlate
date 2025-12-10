/**
 * @file components/tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 목록에서 각 관광지를 카드 형태로 표시하는 컴포넌트입니다.
 * 이미지, 제목, 주소, 타입 뱃지, 전화번호를 표시하고, 클릭 시 상세페이지로 이동합니다.
 *
 * @see {@link docs/PRD.md} - MVP 2.1 요구사항
 */

"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CONTENT_TYPE_NAMES, type ContentTypeId } from "@/lib/types/tour";
import type { TourItem } from "@/lib/types/tour";

interface TourCardProps {
  /** 관광지 정보 */
  tour: TourItem;
}

export function TourCard({ tour }: TourCardProps) {
  // 이미지 URL 처리 (firstimage 우선, 없으면 firstimage2, 둘 다 없으면 placeholder)
  const imageUrl =
    tour.firstimage || tour.firstimage2 || "https://via.placeholder.com/400x300?text=No+Image";

  // 관광 타입명 가져오기
  const contentTypeName =
    CONTENT_TYPE_NAMES[tour.contenttypeid as ContentTypeId] || "기타";

  return (
    <Link
      href={`/places/${tour.contentid}`}
      className="block"
      aria-label={`${tour.title} 상세보기`}
    >
      <article className="border rounded-lg overflow-hidden bg-card hover:scale-[1.02] hover:shadow-lg transition-all duration-200 h-full flex flex-col">
        {/* 이미지 */}
        <div className="relative h-48 w-full bg-muted">
          <Image
            src={imageUrl}
            alt={tour.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized // Phase 6에서 최적화 구현 예정
          />
        </div>

        {/* 내용 */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          {/* 제목 */}
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
            {tour.title}
          </h3>

          {/* 주소 */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">
              {tour.addr1}
              {tour.addr2 && ` ${tour.addr2}`}
            </span>
          </div>

          {/* 뱃지 및 전화번호 */}
          <div className="flex items-center justify-between gap-2 mt-auto">
            <Badge variant="secondary" className="text-xs">
              {contentTypeName}
            </Badge>
            {tour.tel && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{tour.tel}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

