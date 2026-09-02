import type { DashboardCategoryInfo } from "@/types/dashboard";
import type { CategoryAmountItem } from "@/types/category";

export type CategoryExpenseItem = CategoryAmountItem;

export interface CategoryIncreaseItem {
  categoryId: string;
  category: DashboardCategoryInfo;
  delta: number;
}

export interface MonthlyTrendPoint {
  year: number;
  month: number;
  total: number;
}
