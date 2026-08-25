import { MoneyAmount } from "./MoneyAmount";
import { getDaysRemainingInMonth } from "@/lib/date";

interface BudgetSummaryCardProps {
  monthLabel: string;
  householdLabel: string;
  remainingBudget: number;
  income: number;
  expense: number;
}

export function BudgetSummaryCard({
  monthLabel,
  householdLabel,
  remainingBudget,
  income,
  expense,
}: BudgetSummaryCardProps) {
  const daysRemaining = getDaysRemainingInMonth();
  const dailyBudget = remainingBudget > 0 ? Math.floor(remainingBudget / daysRemaining) : null;

  return (
    <section className="ml-card mx-auto w-full max-w-2xl p-6">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-gray-600">{monthLabel}</span>
        <span className="text-sm text-gray-400">{householdLabel}</span>
      </div>

      <p className="mt-3 break-all" aria-live="polite">
        <MoneyAmount
          value={remainingBudget}
          warnOnNegative
          className="text-3xl font-semibold text-gray-900 dark:text-gray-100 sm:text-4xl md:text-5xl"
        />
        {remainingBudget < 0 && <span className="sr-only"> 예산을 초과했습니다</span>}
      </p>
      <p className="mt-1.5 text-sm text-gray-500">
        이번 달 남은 예산
        {dailyBudget !== null && (
          <>
            {" "}
            · 오늘 하루 <MoneyAmount value={dailyBudget} className="text-sm text-gray-500" /> 쓸 수 있어요
          </>
        )}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-xs text-gray-500">수입</p>
          <p className="mt-1">
            <MoneyAmount value={income} showPlusSign className="text-lg font-medium text-gray-900 dark:text-gray-100" />
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-xs text-gray-500">지출</p>
          <p className="mt-1">
            <MoneyAmount value={expense} forceNegative className="text-lg font-medium text-gray-900 dark:text-gray-100" />
          </p>
        </div>
      </div>
    </section>
  );
}
