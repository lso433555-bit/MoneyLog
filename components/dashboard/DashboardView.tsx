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
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6 lg:max-w-6xl">
      <BudgetSummaryCard
        monthLabel={data.monthLabel}
        householdLabel={data.householdLabel}
        remainingBudget={data.remainingBudget}
        income={data.income}
        expense={data.expense}
      />

      <PerforatedDivider />

      {/* 데스크탑(lg+)에서는 한눈에 훑어보는 2단 구성 — 왼쪽은 실제 내역(자주 바뀜),
          오른쪽은 상태를 확인하는 요약 카드(예산 경고, 자산). 모바일은 그대로 세로 한 줄. */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-start lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <RecentTransactionList items={data.recentTransactions} />
          <FixedExpenseList items={data.fixedExpenses} />
        </div>
        <div className="flex flex-col gap-6">
          <CategoryBudgetList items={data.categoryBudgets} />
          <AssetProgressCard assets={data.assets} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => openModal("expense")}
        className="mx-auto flex w-full max-w-2xl items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-gray-100 dark:text-gray-900"
      >
        <Plus size={18} />
        지출 추가
      </button>
    </div>
  );
}
