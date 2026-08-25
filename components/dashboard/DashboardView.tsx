"use client";

import { Plus } from "lucide-react";
import { BudgetSummaryCard } from "./BudgetSummaryCard";
import { PerforatedDivider } from "./PerforatedDivider";
import { FixedExpenseList } from "./FixedExpenseList";
import { RecentTransactionList } from "./RecentTransactionList";
import { AssetProgressCard } from "./AssetProgressCard";
import { CategoryBudgetList } from "./CategoryBudgetList";
import { useTransactionModal } from "@/components/transaction/TransactionModalProvider";
import type { DashboardData } from "@/types/dashboard";

export function DashboardView({ data }: { data: DashboardData }) {
  const { openModal } = useTransactionModal();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-6">
      <BudgetSummaryCard
        monthLabel={data.monthLabel}
        householdLabel={data.householdLabel}
        remainingBudget={data.remainingBudget}
        income={data.income}
        expense={data.expense}
      />

      <PerforatedDivider />

      <FixedExpenseList items={data.fixedExpenses} />
      <RecentTransactionList items={data.recentTransactions} />
      <AssetProgressCard assets={data.assets} />
      <CategoryBudgetList items={data.categoryBudgets} />

      <button
        type="button"
        onClick={() => openModal("expense")}
        className="flex items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <Plus size={18} />
        지출 추가
      </button>
    </div>
  );
}
