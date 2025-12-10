"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4">
        {/* 로고 */}
        <Link href="/" className="text-2xl font-bold">
          My Trip
        </Link>

        {/* 네비게이션 링크 (데스크톱) */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            홈
          </Link>
          <Link
            href="/stats"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            통계
          </Link>
          <Link
            href="/bookmarks"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            북마크
          </Link>
        </nav>

        {/* 우측: 인증 버튼 */}
        <div className="flex gap-4 items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                로그인
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
