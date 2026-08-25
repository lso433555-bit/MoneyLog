import { createClient } from "@/lib/supabase/server";
import { getCurrentMonthRange, getMonthRange, shiftMonth, parseMonthParam, formatMonthParam } from "@/lib/date";
import { formatMonthLabel } from "@/lib/format";
import { ensureRecurringForViewedMonth } from "@/lib/recurring";
import { LoginRequired } from "@/components/ui/LoginRequired";
import { ReportView } from "@/components/report/ReportView";
import type { CategoryExpenseItem, CategoryIncreaseItem, MonthlyTrendPoint } from "@/types/report";
import type { DashboardCategoryInfo } from "@/types/dashboard";

interface ThisMonthRow {
  amount: number;
  category_id: string | null;
  is_fixed: boolean;
  category: DashboardCategoryInfo | null;
}

interface LastMonthRow {
  amount: number;
  category_id: string | null;
}

interface TrendRow {
  amount: number;
  date: string;
}

export default async function ReportPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LoginRequired />;
  }

  const { year, month } = parseMonthParam(searchParams.m);
  const { start, end } = getMonthRange(year, month);
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const { start: prevStart, end: prevEnd } = getMonthRange(prev.year, prev.month);

  const current = getCurrentMonthRange();
  const isNextDisabled = year * 12 + month >= current.year * 12 + current.month;

  // 실제 이번 달을 보고 있을 때만 내부적으로 자동생성 수행 (지난 달 조회 시엔 건드리지 않음).
  await ensureRecurringForViewedMonth(supabase, { userId: user.id, year, month, monthStart: start, monthEnd: end });

  const trendStartMonth = shiftMonth(year, month, -5);
  const { start: trendStart } = getMonthRange(trendStartMonth.year, trendStartMonth.month);

  const [thisMonthRes, lastMonthRes, trendRes] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount, category_id, is_fixed, category:categories(name, icon, color)")
      .eq("type", "expense")
      .gte("date", start)
      .lt("date", end)
      .returns<ThisMonthRow[]>(),
    supabase
      .from("transactions")
      .select("amount, category_id")
      .eq("type", "expense")
      .gte("date", prevStart)
      .lt("date", prevEnd)
      .returns<LastMonthRow[]>(),
    // 이번 달 이전 5개월치 — 이번 달 합계(totalThisMonth)와 합쳐 6개월 추이를 만든다.
    supabase
      .from("transactions")
      .select("amount, date")
      .eq("type", "expense")
      .gte("date", trendStart)
      .lt("date", start)
      .returns<TrendRow[]>(),
  ]);

  const thisMonth = thisMonthRes.data ?? [];
  const lastMonth = lastMonthRes.data ?? [];

  const totalThisMonth = thisMonth.reduce((sum, t) => sum + t.amount, 0);
  const totalLastMonth = lastMonth.reduce((sum, t) => sum + t.amount, 0);

  const fixedTotal = thisMonth.filter((t) => t.is_fixed).reduce((sum, t) => sum + t.amount, 0);
  const variableTotal = totalThisMonth - fixedTotal;

  const categoryMap = new Map<string, CategoryExpenseItem>();
  for (const t of thisMonth) {
    if (!t.category_id || !t.category) continue;
    const existing = categoryMap.get(t.category_id);
    if (existing) existing.amount += t.amount;
    else categoryMap.set(t.category_id, { categoryId: t.category_id, category: t.category, amount: t.amount });
  }
  const categoryBreakdown = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);

  const lastMonthByCategory = new Map<string, number>();
  for (const t of lastMonth) {
    if (!t.category_id) continue;
    lastMonthByCategory.set(t.category_id, (lastMonthByCategory.get(t.category_id) ?? 0) + t.amount);
  }

  const trendByKey = new Map<string, number>();
  for (const t of trendRes.data ?? []) {
    const key = t.date.slice(0, 7); // "YYYY-MM"
    trendByKey.set(key, (trendByKey.get(key) ?? 0) + t.amount);
  }
  const monthlyTrend: MonthlyTrendPoint[] = [
    ...Array.from({ length: 5 }, (_, i) => shiftMonth(year, month, -5 + i)).map(({ year: y, month: m }) => ({
      year: y,
      month: m,
      total: trendByKey.get(`${y}-${String(m).padStart(2, "0")}`) ?? 0,
    })),
    { year, month, total: totalThisMonth },
  ];

  const increases: CategoryIncreaseItem[] = categoryBreakdown
    .map(({ categoryId, category, amount }) => ({
      categoryId,
      category,
      delta: amount - (lastMonthByCategory.get(categoryId) ?? 0),
    }))
    .filter((item) => item.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 3);

  return (
    <ReportView
      monthLabel={formatMonthLabel(new Date(year, month - 1, 1))}
      prevHref={`/report?m=${formatMonthParam(prev.year, prev.month)}`}
      nextHref={`/report?m=${formatMonthParam(next.year, next.month)}`}
      isNextDisabled={isNextDisabled}
      totalThisMonth={totalThisMonth}
      totalLastMonth={totalLastMonth}
      fixedTotal={fixedTotal}
      variableTotal={variableTotal}
      categoryBreakdown={categoryBreakdown}
      increases={increases}
      monthlyTrend={monthlyTrend}
    />
  );
}
