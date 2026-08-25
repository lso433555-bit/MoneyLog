import type { TransactionType } from "@/types/database";
import type { DashboardCategoryInfo } from "@/types/dashboard";

export interface TransactionListItem {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string | null;
  category: DashboardCategoryInfo | null;
  memo: string | null;
  date: string;
  paymentMethod: string | null;
  isFixed: boolean;
  enteredBy: string | null;
}
