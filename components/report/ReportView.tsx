import { MonthNav } from "@/components/ui/MonthNav";
import { ExpenseComparisonCard } from "./ExpenseComparisonCard";
import { CategoryExpenseBars } from "./CategoryExpenseBars";
import { TopIncreasesCallout } from "./TopIncreasesCallout";
import { FixedVariableBar } from "./FixedVariableBar";
import { MonthlyTrendChart } from "./MonthlyTrendChart";
import type { CategoryExpenseItem, CategoryIncreaseItem, MonthlyTrendPoint } from "@/types/report";

interface ReportViewProps {
  monthLabel: string;
  prevHref: string;
  nextHref: string;
  isNextDisabled: boolean;
  totalThisMonth: number;
  totalLastMonth: number;
  fixedTotal: number;
  variableTotal: number;
  categoryBreakdown: CategoryExpenseItem[];
  increases: CategoryIncreaseItem[];
  monthlyTrend: MonthlyTrendPoint[];
}

export function ReportView({
  monthLabel,
  prevHref,
  nextHref,
  isNextDisabled,
  totalThisMonth,
  totalLastMonth,
  fixedTotal,
  variableTotal,
  categoryBreakdown,
  increases,
  monthlyTrend,
}: ReportViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 md:max-w-3xl xl:max-w-5xl">
      <MonthNav monthLabel={monthLabel} prevHref={prevHref} nextHref={nextHref} isNextDisabled={isNextDisabled} />

      <ExpenseComparisonCard totalThisMonth={totalThisMonth} totalLastMonth={totalLastMonth} />
      <MonthlyTrendChart points={monthlyTrend} />
      <CategoryExpenseBars items={categoryBreakdown} />

      <div className="flex flex-col gap-6 md:grid md:grid-cols-2">
        <TopIncreasesCallout items={increases} />
        <FixedVariableBar fixedTotal={fixedTotal} variableTotal={variableTotal} />
      </div>
    </div>
  );
}
