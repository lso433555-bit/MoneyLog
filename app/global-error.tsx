"use client";

import "./globals.css";

// app/error.tsx는 layout.tsx 자체의 에러는 못 잡는다 — 그 경우를 위한 최상위 폴백.
// 루트 레이아웃 전체를 대체하므로 html/body를 직접 그려야 한다.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">문제가 발생했어요</p>
          <p className="text-sm text-gray-400">페이지를 새로고침해주세요.</p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-gray-100 dark:text-gray-900"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
