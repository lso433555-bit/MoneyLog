import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { clampDayOfMonth, getCurrentMonthRange } from "@/lib/date";

interface EnsureRecurringParams {
  householdId: string;
  userId: string;
  year: number;
  month: number;
  monthStart: string;
  monthEnd: string;
}

// 앱 진입(대시보드 로드) 시점에 호출. 활성 고정 템플릿 중 이번 달분 거래가 아직 없는 것만
// 골라 자동 생성한다. 별도 서버 배치 없이 "로드할 때 없으면 만든다" 방식으로 충분하다는 게
// PRD의 결정 사항.
export async function ensureRecurringTransactionsForMonth(
  supabase: SupabaseClient<Database>,
  { householdId, userId, year, month, monthStart, monthEnd }: EnsureRecurringParams
): Promise<void> {
  const { data: templates } = await supabase
    .from("recurring_templates")
    .select("id, type, category_id, amount, day_of_month")
    .eq("household_id", householdId)
    .eq("is_active", true);

  if (!templates || templates.length === 0) return;

  const { data: existing } = await supabase
    .from("transactions")
    .select("recurring_template_id")
    .eq("household_id", householdId)
    .gte("date", monthStart)
    .lt("date", monthEnd)
    .not("recurring_template_id", "is", null);

  const existingTemplateIds = new Set((existing ?? []).map((row) => row.recurring_template_id));
  const missingTemplates = templates.filter((t) => !existingTemplateIds.has(t.id));
  if (missingTemplates.length === 0) return;

  const pad = (n: number) => String(n).padStart(2, "0");

  const rows = missingTemplates.map((t) => ({
    household_id: householdId,
    user_id: userId,
    type: t.type,
    category_id: t.category_id,
    amount: t.amount,
    is_fixed: true,
    date: `${year}-${pad(month)}-${pad(clampDayOfMonth(year, month, t.day_of_month))}`,
    recurring_template_id: t.id,
  }));

  await supabase.from("transactions").insert(rows);
}

interface EnsureForViewedMonthParams {
  userId: string;
  year: number;
  month: number;
  monthStart: string;
  monthEnd: string;
}

// 홈/리포트처럼 "특정 연/월"을 보여주는 화면에서 공통으로 쓰는 진입점.
// 실제 이번 달을 보고 있을 때만 자동생성을 수행한다 — 리포트에서 지난 달을 조회할 때
// 그 시점 기록을 건드리면 안 되기 때문에, 이 판단을 호출부마다 반복하지 않도록 여기서 한 번에 처리한다.
export async function ensureRecurringForViewedMonth(
  supabase: SupabaseClient<Database>,
  { userId, year, month, monthStart, monthEnd }: EnsureForViewedMonthParams
): Promise<void> {
  const current = getCurrentMonthRange();
  if (year !== current.year || month !== current.month) return;

  const { data: householdId } = await supabase.rpc("get_my_household_id");
  if (!householdId) return;

  await ensureRecurringTransactionsForMonth(supabase, { householdId, userId, year, month, monthStart, monthEnd });
}
