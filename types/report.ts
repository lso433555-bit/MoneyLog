import type { DashboardCategoryInfo } from "@/types/dashboard";

export interface CategoryExpenseItem {
  categoryId: string;
  category: DashboardCategoryInfo;
  amount: number;
}

export interface CategoryIncreaseItem {
  categoryId: string;
  category: DashboardCategoryInfo;
  delta: number;
}
