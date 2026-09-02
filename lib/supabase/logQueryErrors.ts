import type { PostgrestError } from "@supabase/supabase-js";

// Server Component들이 `res.data ?? []`로만 처리하고 실패를 조용히 빈 배열로 넘기던 문제 —
// 최소한 서버 로그(Vercel Functions 로그)에는 남겨서, "데이터가 원래 없는 것"과
// "조회가 실패한 것"을 구분할 단서를 남긴다. UI를 바꾸진 않는다(빈 상태 화면은 그대로).
export function logQueryErrors(context: string, results: Record<string, { error: PostgrestError | null }>) {
  for (const [label, result] of Object.entries(results)) {
    if (result.error) {
      console.error(`[${context}] ${label} 조회 실패:`, result.error.message);
    }
  }
}
