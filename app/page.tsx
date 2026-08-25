import { createClient } from "@/lib/supabase/server";
import { getCurrentMonthRange } from "@/lib/date";
import { ensureRecurringTransactionsForMonth } from "@/lib/recurring";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { LoginRequired } from "@/components/ui/LoginRequired";
import type { DashboardData } from "@/types/dashboard";

interface CategoryRef {
  name: string;
  icon: string;
  color: string;
}

interface TransactionRow {
  id: string;
  amount: number;
  type: "income" | "expense";
  is_fixed: boolean;
  memo: string | null;
  date: string;
  category: CategoryRef | null;
}

interface RecurringTemplateRow {
  id: string;
  name: string;
  amount: number;
  category: CategoryRef | null;
}

interface AssetRow {
  id: string;
  name: string;
  type: "loan" | "savings";
  target_amount: number;
  current_amount: number;
}

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LoginRequired />;
  }

  const { start, end, year, month } = getCurrentMonthRange();

  const { data: householdId } = await supabase.rpc("get_my_household_id");
  if (householdId) {
    await ensureRecurringTransactionsForMonth(supabase, {
      householdId,
      userId: user.id,
      year,
      month,
      monthStart: start,
      monthEnd: end,
    });
  }

  const [transactionsRes, recurringRes, assetsRes, membersRes] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, amount, type, is_fixed, memo, date, category:categories(name, icon, color)")
      .gte("date", start)
      .lt("date", end)
      .order("date", { ascending: false })
      .returns<TransactionRow[]>(),
    supabase
      .from("recurring_templates")
      .select("id, name, amount, category:categories(name, icon, color)")
      .eq("is_active", true)
      .eq("type", "expense")
      .order("day_of_month", { ascending: true })
      .returns<RecurringTemplateRow[]>(),
    supabase
      .from("assets")
      .select("id, name, type, target_amount, current_amount")
      .returns<AssetRow[]>(),
    supabase.from("household_members").select("display_name"),
  ]);

  const transactions = transactionsRes.data ?? [];
  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  const householdLabel =
    membersRes.data && membersRes.data.length > 0
      ? membersRes.data.map((m) => m.display_name).join(" · ")
      : "MoneyLog";

  const data: DashboardData = {
    monthLabel: `${year}년 ${month}월`,
    householdLabel,
    remainingBudget: income - expense,
    income,
    expense,
    fixedExpenses: (recurringRes.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      category: item.category,
    })),
    recentTransactions: transactions
      .filter((t) => t.type === "expense" && !t.is_fixed)
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        memo: t.memo,
        amount: t.amount,
        date: t.date,
        category: t.category,
      })),
    assets: (assetsRes.data ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      targetAmount: a.target_amount,
      currentAmount: a.current_amount,
    })),
  };

  return <DashboardView data={data} />;
}
