import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getCurrentMonthRange } from "@/lib/date";

// 데스크탑 사이드바처럼 페이지 전체에 상시 노출되는 요약용 — 이번 달 남은 예산(수입-지출)만
// 가볍게 계산한다. 홈 대시보드의 전체 데이터(카테고리별 집계 등)와는 별개의 가벼운 조회.
export async function getRemainingBudgetSummary(supabase: SupabaseClient<Database>): Promise<number | null> {
  const { start, end } = getCurrentMonthRange();

  const { data } = await supabase.from("transactions").select("amount, type").gte("date", start).lt("date", end);
  if (!data) return null;

  const income = data.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = data.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  return income - expense;
}
