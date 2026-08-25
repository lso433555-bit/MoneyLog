"use client";

import { createClient } from "@/lib/supabase/client";

export function LoginRequired({ error }: { error?: boolean }) {
  const supabase = createClient();

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex flex-col items-center gap-1">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">로그인이 필요합니다</p>
        <p className="text-sm text-gray-400">성완・예은 전용 가계부예요. Google 계정으로 로그인해주세요.</p>
      </div>

      {error && (
        <p className="text-sm text-red-600">로그인에 실패했어요. 허용되지 않은 계정일 수 있어요.</p>
      )}

      <button
        type="button"
        onClick={handleSignIn}
        className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-gray-100 dark:text-gray-900"
      >
        Google로 로그인
      </button>
    </div>
  );
}
