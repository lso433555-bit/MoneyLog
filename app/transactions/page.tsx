import { createClient } from "@/lib/supabase/server";
import { getCurrentMonthRange, getMonthRange, shiftMonth, parseMonthParam, formatMonthParam } from "@/lib/date";
import { formatMonthLabel } from "@/lib/format";
import { ensureRecurringForViewedMonth } from "@/lib/recurring";
import { getMyHouseholdId } from "@/lib/household";
import { LoginRequired } from "@/components/ui/LoginRequired";
import { TransactionsView } from "@/components/transactions/TransactionsView";
import type { TransactionListItem } from "@/types/transactions";

interface TransactionRow {
  id: string;
  type: "income" | "expense";
  amount: number;
  category_id: string | null;
  memo: string | null;
  date: string;
  payment_method: string | null;
  is_fixed: boolean;
  user_id: string;
  category: { name: string; icon: string; color: string } | null;
}

export default async function TransactionsPage({
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

  const current = getCurrentMonthRange();
  const isNextDisabled = year * 12 + month >= current.year * 12 + current.month;

  await ensureRecurringForViewedMonth(supabase, { userId: user.id, year, month });

  const [transactionsRes, membersRes, householdId] = await Promise.all([
    supabase
      .from("transactions")
      .select(
        "id, type, amount, category_id, memo, date, payment_method, is_fixed, user_id, category:categories(name, icon, color)"
      )
      .gte("date", start)
      .lt("date", end)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<TransactionRow[]>(),
    supabase.from("household_members").select("user_id, display_name"),
    getMyHouseholdId(supabase),
  ]);

  // household 인원이 2명뿐일 때만 "누가 입력했는지"가 유용한 정보라 표시한다.
  const memberNameById = new Map((membersRes.data ?? []).map((m) => [m.user_id, m.display_name]));
  const showEnteredBy = memberNameById.size > 1;

  const transactions: TransactionListItem[] = (transactionsRes.data ?? []).map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    categoryId: t.category_id,
    category: t.category,
    memo: t.memo,
    date: t.date,
    paymentMethod: t.payment_method,
    isFixed: t.is_fixed,
    enteredBy: showEnteredBy ? (memberNameById.get(t.user_id) ?? null) : null,
  }));

  return (
    <TransactionsView
      monthLabel={formatMonthLabel(new Date(year, month - 1, 1))}
      prevHref={`/transactions?m=${formatMonthParam(prev.year, prev.month)}`}
      nextHref={`/transactions?m=${formatMonthParam(next.year, next.month)}`}
      isNextDisabled={isNextDisabled}
      transactions={transactions}
      householdId={householdId}
    />
  );
}
