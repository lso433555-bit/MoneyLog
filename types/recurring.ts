import type { TransactionType } from "@/types/database";
import type { CategoryOption } from "@/lib/categories";

export interface RecurringTemplateItem {
  id: string;
  type: TransactionType;
  name: string;
  amount: number;
  dayOfMonth: number;
  isActive: boolean;
  category: CategoryOption | null;
}
