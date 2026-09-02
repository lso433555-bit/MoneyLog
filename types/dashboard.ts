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
  enteredBy: string | null;
}

export interface AssetItem {
  id: string;
  name: string;
  type: "loan" | "savings";
  targetAmount: number;
  currentAmount: number;
}

export interface TopCategoryItem {
  category: DashboardCategoryInfo;
  amount: number;
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
  topCategories: TopCategoryItem[];
}
