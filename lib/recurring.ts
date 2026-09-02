import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { clampDayOfMonth, getCurrentMonthRange, getMonthRange } from "@/lib/date";

interface EnsureRecurringParams {
  householdId: string;
  userId: string;
  year: number;
  month: number;
}

// 앱 진입(대시보드 로드) 시점에 호출. 활성 고정 템플릿 전체에 대해 이번 달분 거래를 보장한다.
// unique(recurring_template_id, date) + upsert(ignoreDuplicates)만으로는, 템플릿의 day_of_month를
// 이미 이번 달분이 생성된 뒤에 수정하면 예전 날짜 행은 그대로 남고 새 날짜로 하나가 더 생겨
// 같은 고정지출이 이번 달에 중복 집계된다. 그래서 먼저 "이 템플릿의 이번 달 기존 행"이 있는지
// template_id 기준으로 확인해, 있으면 날짜만 갱신(금액/카테고리는 의도적으로 소급 반영 안 함)하고
// 없을 때만 새로 insert한다 — 두 기기가 거의 동시에 앱을 열어도 upsert의 unique 제약이 여전히 막아준다.
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
  const { start, end } = getMonthRange(year, month);

  const { data: existing } = await supabase
    .from("transactions")
    .select("id, recurring_template_id, date")
    .eq("household_id", householdId)
    .gte("date", start)
    .lt("date", end)
    .not("recurring_template_id", "is", null);

  const existingByTemplateId = new Map((existing ?? []).map((row) => [row.recurring_template_id, row]));

  const rowsToInsert: Database["public"]["Tables"]["transactions"]["Insert"][] = [];
  const dateUpdates: { id: string; date: string }[] = [];

  for (const t of templates) {
    const targetDate = `${year}-${pad(month)}-${pad(clampDayOfMonth(year, month, t.day_of_month))}`;
    const existingRow = existingByTemplateId.get(t.id);

    if (existingRow) {
      if (existingRow.date !== targetDate) {
        dateUpdates.push({ id: existingRow.id, date: targetDate });
      }
      continue;
    }

    rowsToInsert.push({
      household_id: householdId,
      user_id: userId,
      type: t.type,
      category_id: t.category_id,
      amount: t.amount,
      is_fixed: true,
      date: targetDate,
      recurring_template_id: t.id,
    });
  }

  if (rowsToInsert.length > 0) {
    const { error } = await supabase
      .from("transactions")
      .upsert(rowsToInsert, { onConflict: "recurring_template_id,date", ignoreDuplicates: true });
    if (error) {
      console.error("고정지출 자동생성 실패:", error.message);
    }
  }

  for (const { id, date } of dateUpdates) {
    const { error } = await supabase.from("transactions").update({ date }).eq("id", id);
    if (error) {
      console.error("고정지출 날짜 갱신 실패:", error.message);
    }
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
