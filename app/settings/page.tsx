import { createClient } from "@/lib/supabase/server";
import { getCurrentMonthRange } from "@/lib/date";
import { LoginRequired } from "@/components/ui/LoginRequired";
import { BudgetSettingsView } from "@/components/settings/BudgetSettingsView";
import type { CategoryOption } from "@/lib/categories";

interface BudgetRow {
  category_id: string;
  amount_limit: number;
}

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LoginRequired />;
  }

  const { start, year, month } = getCurrentMonthRange();

  const [categoriesRes, budgetsRes] = await Promise.all([
    supabase.from("categories").select("id, name, icon, color").order("sort_order").returns<CategoryOption[]>(),
    supabase.from("budgets").select("category_id, amount_limit").eq("month", start).returns<BudgetRow[]>(),
  ]);

  const initialBudgets = Object.fromEntries((budgetsRes.data ?? []).map((b) => [b.category_id, b.amount_limit]));

  return (
    <BudgetSettingsView
      monthLabel={`${year}년 ${month}월`}
      month={start}
      categories={categoriesRes.data ?? []}
      initialBudgets={initialBudgets}
      userEmail={user.email ?? ""}
    />
  );
}
