import { createClient } from "@/lib/supabase/server";
import { getCurrentMonthRange } from "@/lib/date";
import { ensureRecurringForViewedMonth } from "@/lib/recurring";
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
  category_id: string | null;
  user_id: string;
  category: CategoryRef | null;
}

interface BudgetRow {
  category_id: string;
  amount_limit: number;
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

export default async function HomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LoginRequired error={searchParams.auth_error === "1"} />;
  }

  const { start, end, year, month } = getCurrentMonthRange();

  await ensureRecurringForViewedMonth(supabase, { userId: user.id, year, month });

  const [transactionsRes, recurringRes, assetsRes, membersRes, budgetsRes] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, amount, type, is_fixed, memo, date, category_id, user_id, category:categories(name, icon, color)")
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
    supabase.from("household_members").select("user_id, display_name"),
    supabase
      .from("budgets")
      .select("category_id, amount_limit, category:categories(name, icon, color)")
      .eq("month", start)
      .returns<BudgetRow[]>(),
  ]);

  const transactions = transactionsRes.data ?? [];
  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  const householdLabel =
    membersRes.data && membersRes.data.length > 0
      ? membersRes.data.map((m) => m.display_name).join(" · ")
      : "MoneyLog";

  // household 인원이 2명뿐일 때만 "누가 입력했는지"가 유용한 정보라 표시한다 —
  // 1인 가구면 굳이 본인 이름을 매 항목마다 반복해서 보여줄 필요가 없다.
  const memberNameById = new Map((membersRes.data ?? []).map((m) => [m.user_id, m.display_name]));
  const showEnteredBy = memberNameById.size > 1;

  const spentByCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense" || !t.category_id) continue;
    spentByCategory.set(t.category_id, (spentByCategory.get(t.category_id) ?? 0) + t.amount);
  }

  const categoryBudgets = (budgetsRes.data ?? [])
    .filter((b): b is BudgetRow & { category: CategoryRef } => b.category !== null)
    .map((b) => ({
      categoryId: b.category_id,
      category: b.category,
      spent: spentByCategory.get(b.category_id) ?? 0,
      limit: b.amount_limit,
    }));

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
        enteredBy: showEnteredBy ? (memberNameById.get(t.user_id) ?? null) : null,
      })),
    assets: (assetsRes.data ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      targetAmount: a.target_amount,
      currentAmount: a.current_amount,
    })),
    categoryBudgets,
  };

  return <DashboardView data={data} />;
}
