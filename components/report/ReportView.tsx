import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ExpenseComparisonCard } from "./ExpenseComparisonCard";
import { CategoryExpenseBars } from "./CategoryExpenseBars";
import { TopIncreasesCallout } from "./TopIncreasesCallout";
import { FixedVariableBar } from "./FixedVariableBar";
import type { CategoryExpenseItem, CategoryIncreaseItem } from "@/types/report";

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
}: ReportViewProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-6">
      <div className="ml-card flex items-center justify-between p-4">
        <Link href={prevHref} aria-label="이전 달" className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <ChevronLeft size={20} />
        </Link>
        <span className="text-base font-semibold text-gray-900">{monthLabel}</span>
        {isNextDisabled ? (
          <span aria-hidden className="rounded-full p-2 text-gray-200">
            <ChevronRight size={20} />
          </span>
        ) : (
          <Link href={nextHref} aria-label="다음 달" className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <ChevronRight size={20} />
          </Link>
        )}
      </div>

      <ExpenseComparisonCard totalThisMonth={totalThisMonth} totalLastMonth={totalLastMonth} />
      <CategoryExpenseBars items={categoryBreakdown} />
      <TopIncreasesCallout items={increases} />
      <FixedVariableBar fixedTotal={fixedTotal} variableTotal={variableTotal} />
    </div>
  );
}
