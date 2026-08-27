import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { clampDayOfMonth, getCurrentMonthRange } from "@/lib/date";

interface EnsureRecurringParams {
  householdId: string;
  userId: string;
  year: number;
  month: number;
}

// 앱 진입(대시보드 로드) 시점에 호출. 활성 고정 템플릿 전체에 대해 이번 달분 거래를
// upsert(ignoreDuplicates)로 생성한다. "조회 후 없으면 insert"가 아니라 DB의
// unique(recurring_template_id, date) 제약에 기대는 방식이라, 두 기기가 거의 동시에
// 앱을 열어도(이 앱의 핵심 사용 패턴) 같은 고정지출이 중복 생성되지 않는다.
export async function ensureRecurringTransactionsForMonth(
  supabase: SupabaseClient<Database>,
  { householdId, userId, year, month }: EnsureRecurringParams
): Promise<void> {
  const { data: templates } = await supabase
    .from("recurring_templates")
    .select("id, type, category_id, amount, day_of_month")
    .eq("household_id", householdId)
    .eq("is_active", true);

  if (!templates || templates.length === 0) return;

  const pad = (n: number) => String(n).padStart(2, "0");

  const rows = templates.map((t) => ({
    household_id: householdId,
    user_id: userId,
    type: t.type,
    category_id: t.category_id,
    amount: t.amount,
    is_fixed: true,
    date: `${year}-${pad(month)}-${pad(clampDayOfMonth(year, month, t.day_of_month))}`,
    recurring_template_id: t.id,
  }));

  const { error } = await supabase
    .from("transactions")
    .upsert(rows, { onConflict: "recurring_template_id,date", ignoreDuplicates: true });

  if (error) {
    console.error("고정지출 자동생성 실패:", error.message);
  }
}

interface EnsureForViewedMonthParams {
  userId: string;
  year: number;
  month: number;
}

// 홈/리포트처럼 "특정 연/월"을 보여주는 화면에서 공통으로 쓰는 진입점.
// 실제 이번 달을 보고 있을 때만 자동생성을 수행한다 — 리포트에서 지난 달을 조회할 때
// 그 시점 기록을 건드리면 안 되기 때문에, 이 판단을 호출부마다 반복하지 않도록 여기서 한 번에 처리한다.
export async function ensureRecurringForViewedMonth(
  supabase: SupabaseClient<Database>,
  { userId, year, month }: EnsureForViewedMonthParams
): Promise<void> {
  const current = getCurrentMonthRange();
  if (year !== current.year || month !== current.month) return;

  const { data: householdId } = await supabase.rpc("get_my_household_id");
  if (!householdId) return;

  await ensureRecurringTransactionsForMonth(supabase, { householdId, userId, year, month });
}
