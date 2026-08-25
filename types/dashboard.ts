export interface DashboardCategoryInfo {
  name: string;
  icon: string;
  color: string;
}

export interface FixedExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: DashboardCategoryInfo | null;
}

export interface RecentTransactionItem {
  id: string;
  memo: string | null;
  amount: number;
  date: string;
  category: DashboardCategoryInfo | null;
}

export interface AssetItem {
  id: string;
  name: string;
  type: "loan" | "savings";
  targetAmount: number;
  currentAmount: number;
}

export interface CategoryBudgetItem {
  categoryId: string;
  category: DashboardCategoryInfo;
  spent: number;
  limit: number;
}

export interface DashboardData {
  monthLabel: string;
  householdLabel: string;
  remainingBudget: number;
  income: number;
  expense: number;
  fixedExpenses: FixedExpenseItem[];
  recentTransactions: RecentTransactionItem[];
  assets: AssetItem[];
  categoryBudgets: CategoryBudgetItem[];
}
