import { createClient } from "@/lib/supabase/server";
import { getCurrentMonthRange } from "@/lib/date";
import { LoginRequired } from "@/components/ui/LoginRequired";
import { BudgetSettingsView } from "@/components/settings/BudgetSettingsView";
import { AssetManager } from "@/components/settings/AssetManager";
import { AccountSection } from "@/components/settings/AccountSection";
import type { CategoryOption } from "@/lib/categories";
import type { AssetManagementItem } from "@/types/assets";

interface BudgetRow {
  category_id: string;
  amount_limit: number;
}

interface AssetRow {
  id: string;
  name: string;
  type: "loan" | "savings";
  target_amount: number;
  current_amount: number;
  monthly_amount: number;
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

  const [categoriesRes, budgetsRes, assetsRes] = await Promise.all([
    supabase.from("categories").select("id, name, icon, color").order("sort_order").returns<CategoryOption[]>(),
    supabase.from("budgets").select("category_id, amount_limit").eq("month", start).returns<BudgetRow[]>(),
    supabase
      .from("assets")
      .select("id, name, type, target_amount, current_amount, monthly_amount")
      .order("created_at")
      .returns<AssetRow[]>(),
  ]);

  const initialBudgets = Object.fromEntries((budgetsRes.data ?? []).map((b) => [b.category_id, b.amount_limit]));

  const assets: AssetManagementItem[] = (assetsRes.data ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    targetAmount: a.target_amount,
    currentAmount: a.current_amount,
    monthlyAmount: a.monthly_amount,
  }));

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 md:max-w-3xl">
      <h1 className="text-lg font-semibold text-gray-900">설정</h1>

      <BudgetSettingsView
        monthLabel={`${year}년 ${month}월`}
        month={start}
        categories={categoriesRes.data ?? []}
        initialBudgets={initialBudgets}
      />

      <AssetManager assets={assets} />

      <AccountSection userEmail={user.email ?? ""} />
    </div>
  );
}
