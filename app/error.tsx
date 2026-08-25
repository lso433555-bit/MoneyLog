"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-lg font-medium text-gray-700 dark:text-gray-300">문제가 발생했어요</p>
      <p className="text-sm text-gray-400">잠시 후 다시 시도해주세요.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-gray-100 dark:text-gray-900"
      >
        다시 시도
      </button>
    </div>
  );
}
