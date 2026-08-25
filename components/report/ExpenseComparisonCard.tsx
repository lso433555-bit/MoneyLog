import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { MoneyAmount } from "@/components/dashboard/MoneyAmount";

// 늘었으면 빨강, 줄었으면 초록 — PRD 4.4.
function computeChange(current: number, previous: number): { pct: number | null; direction: "up" | "down" | "flat" } {
  if (previous <= 0) {
    return { pct: null, direction: current > 0 ? "up" : "flat" };
  }
  const pct = ((current - previous) / previous) * 100;
  if (pct > 0) return { pct, direction: "up" };
  if (pct < 0) return { pct, direction: "down" };
  return { pct: 0, direction: "flat" };
}

export function ExpenseComparisonCard({
  totalThisMonth,
  totalLastMonth,
}: {
  totalThisMonth: number;
  totalLastMonth: number;
}) {
  const { pct, direction } = computeChange(totalThisMonth, totalLastMonth);
  const Icon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus;
  const color = direction === "up" ? "text-red-600" : direction === "down" ? "text-green-600" : "text-gray-400";

  return (
    <section className="ml-card p-6">
      <p className="text-sm text-gray-500">이번 달 총지출</p>
      <p className="mt-1">
        <MoneyAmount value={totalThisMonth} className="text-3xl font-semibold text-gray-900 dark:text-gray-100" />
      </p>
      <div className={`mt-2 flex flex-wrap items-center gap-1.5 text-sm font-medium ${color}`}>
        <Icon size={16} />
        <span>
          {pct === null
            ? direction === "up"
              ? "지난달엔 지출이 없었어요"
              : "지난달과 동일"
            : `${Math.abs(Math.round(pct))}% ${direction === "up" ? "증가" : direction === "down" ? "감소" : "변화 없음"}`}
        </span>
        <span className="font-normal text-gray-400">
          · 지난달 <MoneyAmount value={totalLastMonth} className="text-gray-400" />
        </span>
      </div>
    </section>
  );
}
